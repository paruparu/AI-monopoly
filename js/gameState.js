import { createGameService, createInitialContext } from './fsm/turnMachine.js';
import { boardData } from './game.js';

class GameState {
  constructor(players, onStateChange) {
    this.players = players;
    this.currentPlayer = players[0];
    this.board = boardData;
    this.onStateChange = onStateChange;
    this.service = null;
    this.initializeStateMachine();
  }

  // ステートマシンを初期化
  initializeStateMachine() {
    const initialContext = createInitialContext(this.players, this.board);
    
    this.service = createGameService(initialContext, (state) => {
      this.currentPlayer = state.context.player;
      this.onStateChange(state);
    });
  }

  // ゲームを開始
  startGame() {
    this.service.send('START');
  }

  // サイコロを振る
  rollDice() {
    this.service.send('ROLL');
  }

  // プロパティを購入
  buyProperty() {
    this.service.send('BUY_PROPERTY');
  }

  // パス（購入しない）
  pass() {
    this.service.send('PASS');
  }

  // 次のプレイヤーに進む
  nextPlayer() {
    this.service.send('NEXT_PLAYER');
  }

  // 刑務所から脱出を試みる
  tryEscapeFromJail() {
    this.service.send('TRY_ESCAPE');
  }

  // 保釈金を支払う
  payBail() {
    this.service.send('PAY_BAIL');
  }

  // 刑務所カードを使用
  useGetOutOfJailCard() {
    this.service.send('USE_GET_OUT_OF_JAIL_CARD');
  }

  // 現在の状態を取得
  getState() {
    return this.service.state;
  }

  // 現在のプレイヤーを取得
  getCurrentPlayer() {
    return this.currentPlayer;
  }

  // ボードデータを取得
  getBoard() {
    return this.board;
  }
}

export default GameState;
