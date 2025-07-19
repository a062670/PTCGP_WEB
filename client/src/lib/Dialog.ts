import { Dialog } from 'quasar';

const okBtn = {
  unelevated: true,
  color: 'primary',
  label: '確定',
};
const cancelBtn = {
  flat: true,
  color: 'primary-text',
  label: '取消',
};

const alert = (option: {
  title: string;
  message: string;
  onOk?: () => void | Promise<void>;
  onCancel?: () => void | Promise<void>;
  onDismiss?: () => void | Promise<void>;
}) => {
  Dialog.create({
    title: option.title,
    message: option.message,
    ok: okBtn,
  })
    .onOk(() => {
      void option.onOk?.();
    })
    .onCancel(() => {
      void option.onCancel?.();
    })
    .onDismiss(() => {
      void option.onDismiss?.();
    });
};

const confirm = (option: {
  title: string;
  message: string;
  onOk?: () => void | Promise<void>;
  onCancel?: () => void | Promise<void>;
  onDismiss?: () => void | Promise<void>;
}) => {
  Dialog.create({
    title: option.title,
    message: option.message,
    ok: okBtn,
    cancel: cancelBtn,
  })
    .onOk(() => {
      void option.onOk?.();
    })
    .onCancel(() => {
      void option.onCancel?.();
    })
    .onDismiss(() => {
      void option.onDismiss?.();
    });
};

export default { alert, confirm };
