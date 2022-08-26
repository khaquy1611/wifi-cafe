import React, { ReactNode } from 'react';
import { Modal } from 'antd';

interface Props {
    isShowModal: boolean;
    hideModal: () => void;
    children: ReactNode;
    width?: string | number;
    title?: string;
}

const ModalAction = ({ children, isShowModal, hideModal, width, title }: Props) => {
    return (
        <Modal
            title={title}
            maskClosable={false}
            visible={isShowModal}
            footer={null}
            centered
            onCancel={hideModal}
            width={width || 520}
        >
            {children}
        </Modal>
    );
};

export default ModalAction;
