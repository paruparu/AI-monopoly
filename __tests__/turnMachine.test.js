/**
 * __tests__/turnMachine.test.js
 */
import { jest } from '@jest/globals';
import { createGameService } from '../js/fsm/turnMachine.js';

// テスト用の初期コンテキストを生成するヘルパー関数
function getInitialContext() {
  return {
    player: { 
      name: 'Player 1', 
      position: 0, 
      money: 1500, 
      inJail: false, 
      properties: [],
      consecutiveDoubles: 0,
      jailTurns: 0,
      getOutOfJailCards: 0,
      id: 'player1'
    },
    board: [
      { id: 'go', name: 'GO', type: 'go' },
      { id: 'mediterranean', name: 'Mediterranean Avenue', type: 'property', price: 60, rent: [2, 10, 30, 90, 160, 250], group: 'brown' },
      { id: 'baltic', name: 'Baltic Avenue', type: 'property', price: 60, rent: [4, 20, 60, 180, 320, 450], group: 'brown' },
      { id: 'income-tax', name: 'Income Tax', type: 'tax', amount: 200 },
      { id: 'reading-railroad', name: 'Reading Railroad', type: 'railroad', price: 200, rent: [25, 50, 100, 200] },
      { id: 'oriental', name: 'Oriental Avenue', type: 'property', price: 100, rent: [6, 30, 90, 270, 400, 550], group: 'light_blue' },
      { id: 'chance-1', name: 'Chance', type: 'chance' },
      { id: 'vermont', name: 'Vermont Avenue', type: 'property', price: 100, rent: [6, 30, 90, 270, 400, 550], group: 'light_blue' },
      { id: 'connecticut', name: 'Connecticut Avenue', type: 'property', price: 120, rent: [8, 40, 100, 300, 450, 600], group: 'light_blue' },
      { id: 'jail', name: 'In Jail/Just Visiting', type: 'jail' }
    ],
    players: [
      { 
        id: 'player1', 
        name: 'Player 1', 
        position: 0, 
        money: 1500, 
        inJail: false, 
        properties: [],
        consecutiveDoubles: 0,
        jailTurns: 0,
        getOutOfJailCards: 0 
      },
      { 
        id: 'player2', 
        name: 'Player 2', 
        position: 0, 
        money: 1500, 
        inJail: false, 
        properties: [],
        consecutiveDoubles: 0,
        jailTurns: 0,
        getOutOfJailCards: 0 
      }
    ],
    currentPlayerIndex: 0,
    message: '',
    dice: null,
    service: { send: jest.fn() },
    onPropertyBought: jest.fn()
  };
}

/**
 * 指定された条件を満たす状態を待つヘルパー関数
 * @param {Object} service - XState サービス
 * @param {Function} predicate - 状態チェック関数 (state) => boolean
 * @param {number} timeout - タイムアウト時間 (ms)
 * @returns {Promise<Object>} 条件を満たした状態
 */
async function waitForState(service, predicate, timeout = 5000) {
  return new Promise((resolve, reject) => {
    // 現在の状態をチェック
    const currentState = service.getSnapshot();
    if (predicate(currentState)) {
      return resolve(currentState);
    }

    let timer;
    let subscription;

    // クリーンアップ関数
    const cleanup = () => {
      if (timer) clearTimeout(timer);
      if (subscription) subscription.unsubscribe();
    };

    // タイムアウトを設定
    timer = setTimeout(() => {
      cleanup();
      reject(new Error(`Timeout waiting for state (waited ${timeout}ms)`));
    }, timeout);

    // 状態変更を監視
    subscription = service.subscribe({
      next: (state) => {
        if (predicate(state)) {
          cleanup();
          resolve(state);
        }
      },
      error: (err) => {
        cleanup();
        reject(err);
      }
    });
  });
}

describe('turnMachine', () => {
  let service;
  let subscription;

  beforeEach(() => {
    // 各テスト前に新しいコンテキストでサービスを初期化
    const initialContext = getInitialContext();
    service = createGameService(initialContext);
    
    // 状態遷移をデバッグ用にログ出力
    subscription = service.subscribe(state => {
      console.log('State:', state.value, 'Context:', state.context);
    });
  });

  afterEach(() => {
    // 各テスト後にサブスクリプションを解除
    if (subscription) {
      subscription.unsubscribe();
    }
    
    // サービスを停止
    if (service) {
      service.stop();
    }
  });

  it('初期状態はidle', () => {
    const state = service.getSnapshot();
    expect(state.value).toBe('idle');
  });

  it('START → rolling に遷移し、dice が設定される', async () => {
    // 初期状態を確認
    let state = service.getSnapshot();
    expect(state.value).toBe('idle');
    
    // テスト用のダイス値を設定
    const mockDice = { d1: 2, d2: 3, sum: 5, isDouble: false };
    
    // START イベントを送信
    service.send({ 
      type: 'START',
      dice: mockDice
    });
    
    // rolling 状態に遷移するのを待つ
    state = await waitForState(
      service,
      state => state.value === 'rolling'
    );
    
    // 状態とコンテキストを検証
    expect(state.value).toBe('rolling');
    const { dice, message } = state.context;
    expect(dice).toBeDefined();
    expect(dice).toHaveProperty('d1');
    expect(dice).toHaveProperty('d2');
    expect(dice.sum).toBe(5);
    expect(dice.isDouble).toBe(false);
    expect(typeof message).toBe('string');
  }, 10000);

  it('rolling → MOVED → landing に遷移し、player.position が進む', async () => {
    // テスト用のダイス値を設定
    const mockDice = { d1: 2, d2: 1, sum: 3, isDouble: false };
    
    // START イベントを送信して rolling 状態に
    service.send({ 
      type: 'START',
      dice: mockDice
    });
    
    let state = await waitForState(
      service,
      state => state.value === 'rolling'
    );
    
    // MOVED イベントを送信
    service.send({ 
      type: 'MOVED',
      dice: mockDice
    });
    
    // landing 状態に遷移するのを待つ
    state = await waitForState(
      service,
      state => state.value === 'landing'
    );
    
    // 状態とコンテキストを検証
    expect(state.value).toBe('landing');
    expect(state.context.player.position).toBe(3); // 初期位置0 + ダイスの合計3
    expect(state.context.currentSpace).toBeDefined();
    expect(state.context.currentSpace.id).toBe('income-tax');
  }, 10000);

  it('landing → NEXT_PLAYER → end に遷移し、currentPlayerIndex が進む', async () => {
    // テスト用のダイス値を設定
    const mockDice = { d1: 1, d2: 1, sum: 2, isDouble: true };
    
    // START イベントを送信
    service.send({ 
      type: 'START',
      dice: mockDice
    });
    
    // rolling 状態に遷移するのを待つ
    let state = await waitForState(
      service,
      state => state.value === 'rolling'
    );
    
    // MOVED イベントを送信
    service.send({ 
      type: 'MOVED',
      dice: mockDice
    });
    
    // landing 状態に遷移するのを待つ
    state = await waitForState(
      service,
      state => state.value === 'landing'
    );
    
    // NEXT_PLAYER イベントを送信
    service.send({ type: 'NEXT_PLAYER' });
    
    // end 状態に遷移するのを待つ
    state = await waitForState(
      service,
      state => state.value === 'end'
    );
    
    // 状態とコンテキストを検証
    expect(state.value).toBe('end');
    expect(state.context.currentPlayerIndex).toBe(1); // 次のプレイヤーに進んでいる
    expect(state.context.player.id).toBe('player2'); // 現在のプレイヤーがplayer2になっている
  }, 10000);

  it('end → START で再び rolling になり、player が切り替わる', async () => {
    // 1つ目のプレイヤーのターンを実行
    const mockDice1 = { d1: 1, d2: 1, sum: 2, isDouble: true };
    service.send({ 
      type: 'START',
      dice: mockDice1
    });
    
    let state = await waitForState(
      service,
      state => state.value === 'rolling'
    );
    
    // 1つ目のプレイヤーの移動を実行
    service.send({ 
      type: 'MOVED',
      dice: mockDice1
    });
    
    // landing 状態に遷移するのを待つ
    state = await waitForState(
      service,
      state => state.value === 'landing'
    );
    
    // 次のプレイヤーに移動
    service.send({ type: 'NEXT_PLAYER' });
    
    // end 状態に遷移するのを待つ
    state = await waitForState(
      service,
      state => state.value === 'end'
    );
    
    // 2つ目のプレイヤーのターンを開始
    const mockDice2 = { d1: 3, d2: 4, sum: 7, isDouble: false };
    service.send({ 
      type: 'START',
      dice: mockDice2
    });
    
    // rolling 状態に戻るのを待つ
    state = await waitForState(
      service,
      state => state.value === 'rolling'
    );
    
    // 状態とコンテキストを検証
    expect(state.value).toBe('rolling');
    expect(state.context.currentPlayerIndex).toBe(1);
    expect(state.context.player.id).toBe('player2');
    
    // 1人目のプレイヤーの位置が保持されていることを確認
    expect(state.context.players[0].position).toBe(2); // 1つ目のプレイヤーの位置は2のまま
  }, 15000);
});
