import { copyToClipboard } from 'quasar';
import Notify from 'lib/Notify';

const copyText = (text = '') => {
  if (!text) {
    return;
  }
  copyToClipboard(text)
    .then(() => {
      Notify.success(`已複製到剪貼簿`);
    })
    .catch(() => {
      Notify.error('複製失敗');
    });
};

export default {
  copyText,
};
