import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { ApplicationState } from 'reduxStore/store';
import { getImageManager } from 'reduxStore/imageManager/actions';
import { ImageManagerDataType } from 'api/types';
import { deleteImage } from 'api/store';
import { Button, Upload, message, Table, Typography, Popconfirm, Space } from 'antd';
import { RcFile, UploadChangeParam, UploadFile } from 'antd/lib/upload/interface';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import moment from 'moment';
import { sizeMemory } from 'common';
import Modal from './Modal';

const { Text } = Typography;

const columns = (onDelete: (image: ImageManagerDataType) => void) => [
    {
        title: 'File',
        dataIndex: 'location',
        key: 'location',
        render: (text: string) => <Image src={text} width={32} height={32} onClick={(e) => e.stopPropagation()} />,
    },
    {
        title: 'Dung lượng',
        dataIndex: 'size',
        key: 'size',
        render: (text: number) => <span>{sizeMemory(text)}</span>,
    },
    {
        title: 'Ngày tạo',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (text: string) => <span>{moment(text).format('DD/MM/YYYY HH:mm')}</span>,
    },
    {
        title: '',
        key: 'action',
        dataIndex: 'action',
        render: (_text: string, record: ImageManagerDataType) => (
            <div onClick={(e) => e.stopPropagation()}>
                <Popconfirm
                    title="Bạn chắc chắn muốn xoá ảnh này, nếu xoá có thể lỗi hình ảnh nếu ảnh này được dùng"
                    okText="Có"
                    cancelText="Không"
                    onConfirm={() => onDelete(record)}
                >
                    <Button danger size="small" icon={<DeleteOutlined />}>
                        Xoá
                    </Button>
                </Popconfirm>
            </div>
        ),
    },
];
interface PropsType {
    onClick: (image: ImageManagerDataType) => void;
    isShowModal: boolean;
    hideModal: () => void;
}

interface UploadPropsType {
    name: string;
    action: string;
    withCredentials: boolean;
    method: 'POST';
    maxCount: number;
    accept: string;
    fileList: UploadFile[];
    beforeUpload: (file: RcFile) => boolean;
    onChange: (info: UploadChangeParam) => void;
}

const FileManager = ({ onClick, isShowModal, hideModal }: PropsType) => {
    const dispatch = useDispatch();

    const { group_id, store_id } = useSelector((state: ApplicationState) => state.groupIDState);

    const {
        result: { data, total },
        loading,
    } = useSelector((state: ApplicationState) => state.imageManager);

    const [fileList, setFileList] = useState<UploadFile[]>([]);

    const [currentPagination, setCurrentPagination] = useState<number>(1);

    const uploadProps: UploadPropsType = {
        name: 'file',
        action: `${process.env.API_URL}/api/upload/file?group_id=${group_id}&store_id=${store_id}`,
        withCredentials: true,
        method: 'POST',
        maxCount: 1,
        accept: 'image/*',
        fileList,
        beforeUpload: (file: RcFile) => {
            const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif';
            if (!isJpgOrPng) {
                message.error('Không đúng định dạng file yêu cầu');
            }
            const isLt2M = file.size / 1024 / 1024 < 1;
            if (!isLt2M) {
                message.error('File tải lên phải nhỏ hơn 1MB');
            }
            return isJpgOrPng && isLt2M;
        },
        onChange: async (info: UploadChangeParam) => {
            const {
                fileList,
                file: { status, response },
            } = info;
            setFileList(fileList);
            if (typeof response !== 'undefined') {
                if (status === 'done') {
                    if (response.errorCode === 0) {
                        await dispatch(getImageManager({ group_id, store_id, offset: 0 }));
                        setCurrentPagination(1);
                        message.success('Tải ảnh thành công');
                    } else {
                        message.error(response.message);
                    }
                } else if (status === 'error') {
                    message.error(response.message);
                }
            }
        },
    };

    const onDelete = async (image: ImageManagerDataType) => {
        try {
            await deleteImage(image._id, group_id, store_id);
            dispatch(getImageManager({ group_id, store_id, offset: (currentPagination - 1) * 10 }));
            message.success('Xoá thành công!');
        } catch (err) {
            message.error(err.message);
        }
    };

    useEffect(() => {
        if (isShowModal) {
            dispatch(getImageManager({ group_id, store_id, offset: 0 }));
            setFileList([]);
            setCurrentPagination(1);
        }
    }, [isShowModal]);

    return (
        <Modal isShowModal={isShowModal} hideModal={hideModal}>
            <Space direction="vertical" size="middle">
                <Upload {...uploadProps}>
                    <Button type="primary" icon={<UploadOutlined />}>
                        Tải ảnh
                    </Button>
                </Upload>
                <Text type="secondary">
                    - Kích thước chuẩn để upload ảnh là 500x500, 600x600, 800x800. <br />- File ảnh có một trong những
                    định dạng sau: jpeg, png, jpg, svg.
                </Text>
                <Table
                    loading={loading}
                    onRow={(record: ImageManagerDataType) => ({
                        onClick: () => onClick(record),
                    })}
                    style={{ cursor: 'pointer' }}
                    size="small"
                    columns={columns(onDelete)}
                    dataSource={data}
                    rowKey="_id"
                    pagination={{
                        current: currentPagination,
                        total,
                        showTotal: (total) => {
                            return `Tổng ${total} ảnh`;
                        },
                        onChange: (page) => {
                            setCurrentPagination(page);
                            dispatch(getImageManager({ group_id, store_id, offset: (page - 1) * 10 }));
                        },
                    }}
                />
            </Space>
        </Modal>
    );
};

export default FileManager;
