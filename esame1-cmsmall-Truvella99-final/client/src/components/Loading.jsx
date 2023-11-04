import { Spinner } from "react-bootstrap";

// Loading component, used at first data loading if server response is slow
function LoadingSpinner() {
    return (
        <div className="position-absolute w-100 h-100 d-flex flex-column align-items-center justify-content-center">
            <h1>Loading ...</h1>
            <Spinner animation="border"/>
        </div>
    );
}

export {LoadingSpinner};