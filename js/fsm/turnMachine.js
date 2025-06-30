import { createMachine, assign, interpret } from 'xstate';
import { rollDice } from '../engine/dice.js';

/**
 * ターン制御のステートマシン
 * 状態: idle → rolling → moving → landing → (rolling or end)
 */
export const turnMachine = createMachine({
  id: 'turn',
  initial: 'idle',
  context: {
    player: null,      // 現在のプレイヤー
    dice: null,        // 出目 {d1, d2, sum, isDouble}
    board: null,       // ゲームボード
    players: null,     // 全プレイヤー
    currentPlayerIndex: 0, // 現在のプレイヤーインデックス
    message: ''        // UI表示用メッセージ
  },
  '''  states: {
    // 待機状態（プレイヤーの操作待ち）
    idle: {
      on: {
        // ターン開始（サイコロを振る）
        START: {
          target: 'prepareRolling',
          actions: assign({
            // イベントから渡されたdiceを一時的に保存
            dice: (context, event) => event.dice 
          })
        },
        // カード使用などのアクション
        USE_CARD: {
          actions: ['handleCardUse']
        }
      }
    },

    // サイコロを振る準備
    prepareRolling: {
      entry: assign({
        // diceがなければ、ここで振る
        dice: (context) => context.dice || rollDice(),
      }),
      always: 'rolling'
    },
    
    // サイコロを振る
    rolling: {
      entry: [
        // メッセージを更新
        assign({
          message: (context) => {
            const { dice } = context;
            return `サイコロの目: ${dice.d1}と${dice.d2} (合計: ${dice.sum})`;
          }
        }),
        // 3回連続でゾロ目なら刑務所行き
        'checkTripleDoubles'
      ],''
      always: [
        {
          // 3回連続ダブルの場合
          target: 'jail',
          cond: 'isTripleDoubles',
          actions: assign({
            message: () => '3回連続でゾロ目！刑務所行きです！'
          })
        },
        {
          // 通常の移動
          target: 'moving',
          actions: assign({
            message: (context) => {
              const { dice } = context;
              return `マスを${dice.sum}進みます`;
            }
          })
        }
      ]
    },
    
    // 移動中
    moving: {
      entry: 'movePlayer',
      on: {
        MOVED: 'landing'
      }
    },
    
    // 着地時処理
    landing: {
      entry: ['handleLanding', 'notifyLanding'],
      on: {
        // プロパティ購入の選択
        BUY_PROPERTY: {
          actions: 'buyProperty'
        },
        // チャンスカードを引く
        DRAW_CHANCE: {
          actions: 'drawChanceCard'
        },
        // 税金を支払う
        PAY_TAX: {
          actions: 'payTax'
        },
        // 刑務所へ行く
        GO_TO_JAIL: {
          target: 'jail',
          actions: 'sendToJail'
        },
        // 次のプレイヤーへ
        NEXT_PLAYER: 'end'
      },
      always: [
        {
          // ゾロ目の場合、もう一度サイコロを振る
          target: 'rolling',
          cond: 'isDouble'
        }
      ]
    },
    
    // 刑務所
    jail: {
      entry: 'sendToJail',
      on: {
        // 刑務所からの脱出を試みる
        TRY_ESCAPE: {
          target: 'jailRolling',
          actions: assign({
            message: () => '刑務所から脱出します...'
          })
        },
        // 保保釈金を払う
        PAY_BAIL: {
          target: 'end',
          actions: 'payBail',
          cond: 'canPayBail'
        },
        // カードを使用する
        USE_GET_OUT_OF_JAIL_CARD: {
          target: 'end',
          actions: 'useJailCard',
          cond: 'hasJailCard'
        }
      }
    },
    
    // 刑務所でのサイコロ
    jailRolling: {
      entry: assign({
        dice: () => rollDice()
      }),
      always: [
        {
          // ゾロ目で脱出成功
          target: 'moving',
          cond: 'isDouble',
          actions: assign({
            message: () => 'ゾロ目！刑務所から脱出しました！'
          })
        },
        {
          // 3回目で強制出費
          target: 'end',
          cond: 'isThirdJailTurn',
          actions: 'forcePayBail'
        },
        {
          // それ以外はターン終了
          target: 'end',
          actions: assign({
            message: (context) => {
              const { player } = context;
              return `脱出失敗... あと${3 - player.jailTurns}回のチャンス`;
            }
          })
        }
      ]
    },
    
    // ターン終了
    end: {
      entry: [
        'endTurn',
        assign({
          message: 'ターン終了'
        })
      ],
      type: 'final'
    }
  }
}, {
  actions: {
    // プレイヤーを移動
    movePlayer: assign({
      player: (context, event) => {
        const { player, dice, board } = context;
        const newPosition = (player.position + dice.sum) % board.length;
        const passedGo = player.position + dice.sum >= board.length;
        
        return {
          ...player,
          position: newPosition,
          money: player.money + (passedGo ? 200 : 0), // GO通過で$200
          passedGo
        };
      }
    }),
    
    // 着地時の処理
    handleLanding: assign({
      currentSpace: (context) => context.board[context.player.position],
      owner: (context) => context.players.find(p => p.properties.includes(context.board[context.player.position]?.id)),
      message: (context) => {
        const space = context.board[context.player.position];
        const owner = context.players.find(p => p.properties.includes(space?.id));
        if (!space) return '';
        
        if (owner) {
          if (owner.id === context.player.id) {
            return `${context.player.name}は自分の${space.name}に止まりました`;
          } else {
            return `${context.player.name}は${owner.name}の${space.name}に止まりました`;
          }
        }
        return `${context.player.name}が${space.name}に止まりました`;
      }
    }),
    
    // 家賃を計算
    calculateRent: (context, space, owner) => {
      if (!space || !owner) return 0;
      
      let rent = 0;
      
      if (space.type === 'property') {
        const group = space.group;
        const ownedInGroup = context.board.filter(
          s => s.group === group && owner.properties.includes(s.id)
        ).length;
        const totalInGroup = context.board.filter(s => s.group === group).length;
        
        if (ownedInGroup === totalInGroup) {
          // 色グループを全て所有している場合、2倍の家賃
          rent = space.rent[0] * 2;
        } else {
          rent = space.rent[0];
        }
      } else if (space.type === 'railroad') {
        const ownedRailroads = context.board.filter(
          s => s.type === 'railroad' && owner.properties.includes(s.id)
        ).length;
        rent = space.rent[Math.min(ownedRailroads - 1, 3)];
      } else if (space.type === 'utility') {
        const ownedUtilities = context.board.filter(
          s => s.type === 'utility' && owner.properties.includes(s.id)
        ).length;
        const diceRoll = context.dice?.sum || 7; // 前回のサイコロの目を使用
        rent = diceRoll * (ownedUtilities === 2 ? 10 : 4);
      }
      
      return rent;
    },
    
    // 着地を通知
    notifyLanding: (context) => {
      const space = context.board[context.player.position];
      if (!space) return;
      
      // 着地したマスの種類に応じた処理を実行
      if (['property', 'railroad', 'utility'].includes(space.type)) {
        const owner = context.players.find(p => p.properties.includes(space.id));
        if (owner) {
          if (owner.id !== context.player.id) {
            // 他のプレイヤーの所有地の場合、家賃を計算して支払い
            const rent = context.actions.calculateRent(context, space, owner);
            context.service.send({ type: 'PAY_RENT', ownerId: owner.id, amount: rent });
          }
        } else if (space.price && space.price > 0) {
          // 未所有の物件の場合、購入プロンプトを表示
          context.service.send({ type: 'PROMPT_BUY', property: space });
        }
      } else if (space.type === 'chance') {
        context.service.send('DRAW_CHANCE');
      } else if (space.type === 'tax') {
        context.service.send({ type: 'PAY_TAX', amount: space.amount || 200 });
      } else if (space.type === 'go_to_jail') {
        context.service.send('GO_TO_JAIL');
      }
    },
    
    // 物件を購入
    buyProperty: assign({
      player: (context) => {
        const player = { ...context.player };
        const space = context.board[player.position];
        
        if (space && space.price && player.money >= space.price) {
          player.money -= space.price;
          player.properties = [...player.properties, space.id];
          // UI更新をトリガー
          context.onPropertyBought?.(player, space);
        }
        
        return player;
      },
      message: (context) => {
        const space = context.board[context.player.position];
        return `${context.player.name}が${space.name}を購入しました`;
      }
    }),
    
    // 税金を支払う
    payTax: assign({
      player: (context, event) => {
        const player = { ...context.player };
        const amount = event.amount || 200;
        player.money = Math.max(0, player.money - amount);
        return player;
      },
      message: (context, event) => {
        const amount = event.amount || 200;
        return `${context.player.name}が税金¥${amount}を支払いました`;
      }
    }),
    
    // チャンスカードを引く
    drawChanceCard: assign({
      message: (context) => {
        const cards = [
          'GOに進む',
          '鉄道会社の株式を売却して¥1000を得る',
          '各プレイヤーに¥2000を支払う',
          '刑務所へ行く',
          '最寄りの鉄道に進む',
          '最寄りの公共事業会社に進む'
        ];
        const card = cards[Math.floor(Math.random() * cards.length)];
        
        // カードの効果を適用
        if (card === 'GOに進む') {
          context.service.send({ type: 'MOVE_TO', position: 0 });
        } else if (card === '最寄りの鉄道に進む') {
          // 最寄りの鉄道に進むロジック
          let position = context.player.position;
          while (context.board[position % 40].type !== 'railroad') {
            position++;
          }
          context.service.send({ type: 'MOVE_TO', position: position % 40 });
        } else if (card === '最寄りの公共事業会社に進む') {
          // 最寄りの公共事業会社に進むロジック
          let position = context.player.position;
          while (context.board[position % 40].type !== 'utility') {
            position++;
          }
          context.service.send({ type: 'MOVE_TO', position: position % 40 });
        } else if (card === '刑務所へ行く') {
          context.service.send('GO_TO_JAIL');
        }
        
        return `${context.player.name}が「${card}」を引きました`;
      }
    }),
    
    // 刑務所に送る
    sendToJail: assign({
      player: (context) => ({
        ...context.player,
        inJail: true,
        position: 10, // 刑務所の位置
        jailTurns: 0
      })
    }),
    
    // 保釈金を支払う
    payBail: assign({
      player: (context) => ({
        ...context.player,
        money: context.player.money - 50,
        inJail: false
      })
    }),
    
    // 刑務所カードを使用
    useJailCard: assign({
      player: (context) => ({
        ...context.player,
        getOutOfJailCards: context.player.getOutOfJailCards - 1,
        inJail: false
      })
    }),
    
    // 3回目で強制的に保釈金を支払う
    forcePayBail: assign({
      player: (context) => ({
        ...context.player,
        money: context.player.money - 50,
        inJail: false
      })
    }),
    
    // ターン終了処理
    endTurn: assign({
      currentPlayerIndex: (context) => 
        (context.currentPlayerIndex + 1) % context.players.length,
      player: (context) => {
        const nextIndex = (context.currentPlayerIndex + 1) % context.players.length;
        return context.players[nextIndex];
      }
    }),
    
    // 3回連続ゾロ目チェック
    checkTripleDoubles: assign({
      player: (context) => {
        const { player, dice } = context;
        const consecutiveDoubles = dice.d1 === dice.d2 
          ? (player.consecutiveDoubles || 0) + 1 
          : 0;
          
        return {
          ...player,
          consecutiveDoubles
        };
      }
    })
  },
  
  guards: {
    // ゾロ目かどうか
    isDouble: (context) => context.dice.d1 === context.dice.d2,
    
    // 3回連続ゾロ目か
    isTripleDoubles: (context) => {
      return context.player.consecutiveDoubles >= 3;
    },
    
    // 刑務所3ターン目か
    isThirdJailTurn: (context) => {
      return context.player.jailTurns >= 2; // 0,1,2 で3ターン目
    },
    
    // 保釈金を支払えるか
    canPayBail: (context) => {
      return context.player.money >= 50;
    },
    
    // 刑務所カードを持っているか
    hasJailCard: (context) => {
      return context.player.getOutOfJailCards > 0;
    }
  }
});

/**
 * ゲームの初期コンテキストを作成
 * @param {Array} players - プレイヤー配列
 * @param {Array} board - ゲームボード
 * @returns {Object} 初期コンテキスト
 */
export function createInitialContext(players, board) {
  return {
    player: players[0],
    players,
    board,
    currentPlayerIndex: 0,
    dice: null,
    message: 'ゲームを開始します。最初のプレイヤーの番です。'
  };
}

/**
 * ゲームサービスを初期化
 * @param {Object} context - 初期コンテキスト
 * @param {Function} onStateChange - 状態変更時のコールバック
 * @returns {Object} ゲームサービス
 */
export function createGameService(context, onStateChange) {
  // 1) .provide() でマシン定義の context/actions/guards を上書き
  const machineWithContext = turnMachine.provide({
    context: (ctx, event) => ({
      ...ctx,
      ...context,
      // 必須フィールドが未定義の場合はデフォルト値を設定
      player: context.player || null,
      board: context.board || [],
      players: context.players || [],
      currentPlayerIndex: context.currentPlayerIndex || 0,
      dice: context.dice || { d1: 1, d2: 1, sum: 2, isDouble: false },
      message: context.message || ''
    }),
    actions: {
      /* 必要なら置き換え */
    },
    guards: {
      /* 必要なら置き換え */
    }
  });

  // 2) interpret() でサービスを作成
  const service = interpret(machineWithContext);

  // 3) subscribe() で state の変更を監視
  if (onStateChange) {
    service.subscribe({
      next: (state) => onStateChange(state),
      error: (err) => console.error('Error in state subscription:', err)
    });
  }

  service.start();
  return service;
}
