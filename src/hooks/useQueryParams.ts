import { QUERY_PARAMS } from "../utils/shared/constants";

export const parseQueryParam = () => {
    const search = window.location.search;
    const urlParams = new URLSearchParams(search);
    return {
        emailSigningFinished: !!urlParams.get(QUERY_PARAMS.EMAIL_SIGNIN_FINISHED),
    }
}

const useQueryParam = () => {
    return parseQueryParam();
}


export default useQueryParam;