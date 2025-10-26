import { Helmet as RHelmet } from 'react-helmet-async';

interface HelmetProps {
    title: string;
    description: string;
    img?: string;
}

export const Helmet = (props: HelmetProps) => {
    const { title, description, img } = props;

    return (
        <RHelmet>
            <title>{title}</title>
            <meta name="description" content={description} />

            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            {img && <meta property="og:image" content={img} />}

            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            {img && <meta name="twitter:image" content={img} />}
        </RHelmet>
    );
};
