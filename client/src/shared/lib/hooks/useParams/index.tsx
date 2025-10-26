import { useSearchParams } from 'react-router-dom';
import queryString from 'query-string';

export function useParams() {
    const [_, setSearchParamsParams] = useSearchParams();

    const parsedUrl = queryString.parse(location.search);

    const setParams = (params: { [key: string]: string | boolean }) => {
        const stringifiedParams = queryString.stringify(params);
        const newParams = new URLSearchParams(stringifiedParams);
        setSearchParamsParams(newParams);
    };

    const getParamValue = (paramName: string) => {
        if (parsedUrl[paramName]) {
            return parsedUrl[paramName];
        }
        return undefined;
    };

    return {
        getParams: parsedUrl,
        setParams,
        getParamValue,
    };
}
