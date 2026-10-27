import { UseLoading } from "./LoadingContext";
import "./global-loading.css";

const GlobalLoading = () => {
    const { loading } = UseLoading();

    if (!loading) return null;

    return (
        <div className="global-loading">
            <div className="loading-spinner"></div>
        </div>
    );
};

export default GlobalLoading;