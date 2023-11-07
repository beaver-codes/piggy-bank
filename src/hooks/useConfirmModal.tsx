import { useState } from "react";
import { Modal } from "react-bootstrap";
import { texts } from "../utils/texts";

const useConfirmModal = (msgText: string): [() => JSX.Element, Function] => {
    const [callbacks, setCallbacks] = useState<Function[]>([]);
    const trigger = (callback: Function) => setCallbacks([callback]);
    const handleConfirm = async () => {
        setCallbacks([]);
        await callbacks[0]();
    }


    const ConfirmModal = () => {
        return <Modal show={!!callbacks.length} onHide={() => setCallbacks([])} className="modal fade">
            <Modal.Header closeButton>
                <div className="center ">

                    <div className='center me-2 bg-danger-lighter p-2 rounded-circle center'>
                        <div className='center bg-danger-light p-2 rounded-circle center' style={{ width: '45px' }}>
                            <i className="bi bi-exclamation-circle text-danger h4 m-0" />
                        </div>
                    </div>
                    <Modal.Title className="mb-1">{texts.confirmation}</Modal.Title>
                </div>
            </Modal.Header>
            <Modal.Body>
                <p>{msgText}</p>
                <p>{texts.thisActionCannotBeUndone}</p>
                <div className='mt-5 d-flex justify-content-between'>
                    <button className='btn btn-outline-secondary flex-1' onClick={() => setCallbacks([])}>{texts.cancel}</button>
                    <button className='btn btn-danger flex-1' onClick={handleConfirm} >{texts.confirm}</button>
                </div>
            </Modal.Body>
        </Modal>;
    }

    return [ConfirmModal, trigger]
}

export default useConfirmModal;