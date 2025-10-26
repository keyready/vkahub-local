import React from 'react';

import './Spinner.scss';

interface SpinnerProps {
    width?: string;
    height?: string;
    fill?: string;
}

export const Spinner = (props: SpinnerProps) => {
    const { fill = 'white', width = '48', height = '48' } = props;

    return (
        <svg
            width={width}
            height={height}
            fill={fill}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g className="spinner_auJJ">
                <circle className="spinner_EUy1" cx="12" cy="3" r="1" />
                <circle className="spinner_EUy1 spinner_f6oS" cx="16.50" cy="4.21" r="1" />
                <circle className="spinner_EUy1 spinner_NTs9" cx="7.50" cy="4.21" r="1" />
                <circle className="spinner_EUy1 spinner_g3nX" cx="19.79" cy="7.50" r="1" />
                <circle className="spinner_EUy1 spinner_4vv9" cx="4.21" cy="7.50" r="1" />
                <circle className="spinner_EUy1 spinner_nvEs" cx="21.00" cy="12.00" r="1" />
                <circle className="spinner_EUy1 spinner_GOx1" cx="3.00" cy="12.00" r="1" />
                <circle className="spinner_EUy1 spinner_MaNM" cx="19.79" cy="16.50" r="1" />
                <circle className="spinner_EUy1 spinner_YaQo" cx="4.21" cy="16.50" r="1" />
                <circle className="spinner_EUy1 spinner_4nle" cx="16.50" cy="19.79" r="1" />
                <circle className="spinner_EUy1 spinner_HXuO" cx="7.50" cy="19.79" r="1" />
                <circle className="spinner_EUy1 spinner_ZETM" cx="12" cy="21" r="1" />
            </g>
        </svg>
    );
};
