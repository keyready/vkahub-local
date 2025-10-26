import {memo} from "react";
import {Toaster as ReactHotToaster} from "react-hot-toast";

import classes from "./Toaster.module.scss";

import {classNames} from "@/shared/lib/classNames";

interface ToasterProps {
    className?: string;
}

export const Toaster = memo((props: ToasterProps) => {
    const { className } = props;

    return (
        <ReactHotToaster
            containerClassName={classNames(classes.Toaster, {}, [className])}
            position="top-left"
            reverseOrder={false}
            gutter={8}
            containerStyle={{}}
            toastOptions={{
                className: '',
                style: {
                    background: '#27272a',
                    color: '#b8b8b8',
                    textAlign: 'center',
                },
            }}
        />
    );
});
