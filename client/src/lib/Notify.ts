import { Notify } from 'quasar';

/**
 * 顯示錯誤訊息
 * @param  {String} msg
 * @param  {Number} [time=5000] - 顯示時間(ms)，預設 5000
 */
const error = (msg: string, time = 5000) => {
  Notify.create({
    timeout: time,
    message: msg,
    position: 'top',
    classes: 'bg-negative',
    actions: [
      {
        icon: 'close',
        color: 'white',
        round: true,
        size: 'sm',
        handler: () => {
          /* ... */
        },
      },
    ],
  });
};

/**
 * 顯示成功訊息
 * @param  {String} msg
 * @param  {Number} [time=1000] - 顯示時間(ms)，預設 1000
 */
const success = (msg: string, time = 5000) => {
  Notify.create({
    timeout: time,
    message: msg,
    position: 'top',
    classes: 'bg-positive',
    actions: [
      {
        icon: 'close',
        color: 'white',
        round: true,
        size: 'sm',
        handler: () => {
          /* ... */
        },
      },
    ],
  });
};

export default { error, success };
