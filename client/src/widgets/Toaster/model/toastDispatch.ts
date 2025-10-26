import toast from 'react-hot-toast';

interface Messages {
    loading: string;
    success: string;
    error: string;
}

const defaultMessages: Messages = {
    error: 'Произошла ошибка',
    loading: 'Запрос выполняется',
    success: 'Запрос выполнен',
};

export const toastDispatch = async (promise: Promise<any>, messages?: Partial<Messages>) => {
    const initialMessages = { ...defaultMessages, ...messages };

    const toastId = toast.loading(initialMessages?.loading);
    const result = await promise;

    if (result?.meta?.requestStatus === 'fulfilled' || result.data) {
        toast.remove(toastId);
        // @ts-ignore
        toast.success(result.payload?.message || initialMessages?.success);
    } else {
        toast.dismiss(toastId);
        // @ts-ignore
        toast.error(result.payload?.message || initialMessages?.error);
    }

    return result;
};
