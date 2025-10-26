import { Toast } from 'react-hot-toast';

interface ProposalApproveToastProps {
    t: Toast;
    onApprove: () => void;
    onCancel: () => void;
}

export const ProposalApproveToast = (props: ProposalApproveToastProps) => {
    const { t, onCancel, onApprove } = props;

    return (
        <div className="w-1/6 bg-accent rounded-md px-6 py-8">
            <h1>приет мир</h1>
        </div>
    );
};
