/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import moment from 'moment';
import axios from 'axios';
import {
    Button,
    Col,
    Form,
    Input,
    InputNumber,
    message,
    Modal,
    Popconfirm,
    Row,
    Select,
    Space,
    Tooltip,
    Typography,
    Upload,
} from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { parseCookies } from 'nookies';
import { dataWareHouse, IngredientType } from 'api/types';
import { DeleteOutlined, SearchOutlined, UploadOutlined } from '@ant-design/icons';
import { RcFile, UploadChangeParam, UploadFile } from 'antd/lib/upload/interface';
import { addReceipt, listReceiptType } from 'api/receipt';
import { cancelReceipt, detailReceipt, updateReceipt } from 'api/store';
import ModalSearchIngredient from '../products/ModalSearchIngredient';

const { TextArea } = Input;

type IProps = {
    isModalVisible: boolean;
    setIsModalVisible: (isModalVisible: boolean) => void;
    dataReceipt: {
        type: 'add_import' | 'add_export' | 'update' | 'detail';
        id?: string;
        initWarehouse?: IngredientType;
    };
    reloadList?: () => void;
};

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

const ModalReceipt = ({ isModalVisible, setIsModalVisible, dataReceipt, reloadList }: IProps) => {
    const [valueIngredient, setValueIngredient] = useState<string>('');
    const [isModalSearch, setIsModalSearch] = useState(false);
    const [linkWareHouse, setLinkWareHouse] = useState<any>([]);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [receiptTypeList, setReceiptTypeList] = useState([]);
    const [inputAmountSelect, setInputAmountSelect] = useState();
    const [detailDataReceipt, setDetailDataReceipt] = useState<any>();
    const [form] = useForm();
    const { group_id, store_id } = parseCookies();

    useEffect(() => {
        setFileList([]);
        setValueIngredient('');
        setLinkWareHouse([]);
        setDetailDataReceipt(undefined);
        form.resetFields();
    }, [isModalVisible]);

    const fetchReceiptType = async () => {
        try {
            const res = await listReceiptType({
                group_id,
                store_id,
                type: dataReceipt.type === 'add_export' ? 'export' : 'import',
            });
            setReceiptTypeList(res.data);
        } catch (error) {
            message.error((error as Error).message);
        }
    };

    useEffect(() => {
        fetchReceiptType();
    }, [dataReceipt.type]);

    useEffect(() => {
        if (dataReceipt.initWarehouse) {
            setLinkWareHouse([{ ...dataReceipt.initWarehouse, warehouse_id: dataReceipt.initWarehouse._id }]);
        }
    }, [dataReceipt]);

    useEffect(() => {
        const getDetailReceipt = async () => {
            const res = await detailReceipt({ id: dataReceipt.id, group_id, store_id });
            const link_warehouse = res?.data?.data?.link_warehouse ?? res?.data?.link_warehouse;
            form.setFieldsValue(res?.data);
            setDetailDataReceipt(res?.data);
            setLinkWareHouse(link_warehouse);
        };
        if (isModalVisible && (dataReceipt.type === 'detail' || dataReceipt.type === 'update')) getDetailReceipt();
    }, [dataReceipt, group_id, store_id]);

    const uploadProps: UploadPropsType = {
        name: 'file',
        action: `${process.env.API_URL}/api/upload/file?group_id=${group_id}&store_id=${store_id}&type_upload=receipt`,
        withCredentials: true,
        method: 'POST',
        maxCount: 1,
        accept: 'image/*,application/pdf',
        fileList,
        beforeUpload: (file: RcFile) => {
            const isJpgOrPngOrPdf =
                file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'application/pdf';
            if (!isJpgOrPngOrPdf) {
                message.error('Không đúng định dạng file yêu cầu');
            }
            const isLt1M = file.size / 1024 / 1024 < 1;
            if (!isLt1M) {
                message.error('File tải lên phải nhỏ hơn 1MB');
            }
            return isJpgOrPngOrPdf && isLt1M;
        },
        onChange: async (info: UploadChangeParam) => {
            if (info.file.response && info.file.response.errorCode === 0 && info.file.status === 'done') {
                message.success('Tải lên thành công');
                setFileList([info.file]);
            }
            if (info.file.status === 'removed') {
                message.success('Xóa thành công');
                setFileList([]);
            }
            if (info.file.status === 'error') {
                message.success('Tải lên thất bại');
            }
        },
    };

    useEffect(() => {
        if (valueIngredient) {
            setIsModalSearch(true);
        } else {
            setIsModalSearch(false);
        }
    }, [valueIngredient]);

    let title;
    switch (dataReceipt.type) {
        case 'add_import':
            title = 'Thêm phiếu nhập';
            break;
        case 'add_export':
            title = 'Thêm phiếu xuất';
            break;
        default:
            title = 'Chi tiết';
            break;
    }

    const handleModalCancel = () => {
        setIsModalVisible(false);
        setFileList([]);
        setValueIngredient('');
        setLinkWareHouse([]);
        form.resetFields();
    };

    const onCreate = async (status: string) => {
        const values = await form.validateFields();
        const body = {
            group_id,
            store_id,
            type: dataReceipt.type === 'add_import' ? 'import' : 'export',
            receipt_type: values.receipt_type,
            name: values.name,
            code: values.code,
            file: fileList[0] && fileList[0].response.data,
            desc: values.desc,
            link_warehouse: linkWareHouse.map((item: { _id: string; quantity: string }) => ({
                warehouse_id: item._id,
                quantity: item.quantity,
            })),
            status,
        };
        if (linkWareHouse.length === 0) {
            message.error('Danh sách mặt hàng, nguyên liệu không được để trống');
            return;
        }
        for (let index = 0; index < linkWareHouse.length; index += 1) {
            if (!linkWareHouse[index].quantity) {
                message.error('Số lượng mặt hàng, nguyên liệu không được để trống hoặc phải lớn hơn 0');
                return;
            }
        }
        try {
            await addReceipt(body);
            message.success('Thêm mới phiếu thành công');
            handleModalCancel();
            reloadList && reloadList();
        } catch (error) {
            message.error((error as Error).message);
        }
    };

    const onExportPdf = async () => {
        try {
            const res = await axios({
                method: 'GET',
                url: `${process.env.API_URL}/api/receipt/export-pdf/${detailDataReceipt?._id}`,
                params: {
                    group_id,
                    store_id,
                },
                withCredentials: process.env.APP_DEBUG === 'production',
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            const fileName = detailDataReceipt?.type === 'import' ? 'phieu-nhap-kho' : 'phieu-xuat-kho';
            link.setAttribute('download', `${fileName}.pdf`);
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            message.error((error as Error).message);
        }
    };

    const onCancelReceipt = async (record: dataWareHouse) => {
        try {
            await cancelReceipt(record?._id, group_id, store_id);
            reloadList && reloadList();
            setIsModalVisible(false);
            message.success('Thành công');
        } catch (error) {
            message.error((error as Error).message);
        }
    };

    const onUpdateReceipt = async (status: string) => {
        const values = await form.validateFields();
        const body = {
            group_id,
            store_id,
            type: 'import',
            receipt_type: values.receipt_type,
            name: values.name,
            code: values.code,
            file: fileList[0] && fileList[0].response.data,
            desc: values.desc,
            link_warehouse: linkWareHouse.map((item: any) => ({
                warehouse_id: item.warehouse_id,
                quantity: item.quantity,
            })),
            status,
        };
        if (linkWareHouse.length === 0) {
            message.error('Danh sách mặt hàng, nguyên liệu không được để trống');
            return;
        }
        for (let index = 0; index < linkWareHouse.length; index += 1) {
            if (!linkWareHouse[index].quantity) {
                message.error('Số lượng mặt hàng, nguyên liệu không được để trống hoặc phải lớn hơn 0');
                return;
            }
        }
        try {
            await updateReceipt(detailDataReceipt?._id, body);
            reloadList && reloadList();
            setIsModalVisible(false);
            message.success('Cập nhật thành công');
        } catch (error) {
            message.error((error as Error).message);
        }
    };

    const listButton = () => {
        switch (dataReceipt.type) {
            case 'add_import':
                return (
                    <Row justify="center">
                        <Space wrap size="middle">
                            <Button danger type="primary" onClick={handleModalCancel}>
                                Hủy
                            </Button>
                            <Button type="primary" onClick={() => onCreate('order')}>
                                Đặt hàng
                            </Button>
                            <Button type="primary" onClick={() => onCreate('import')}>
                                Đặt hàng và nhập kho
                            </Button>
                        </Space>
                    </Row>
                );
            case 'add_export':
                return (
                    <Row justify="center">
                        <Space wrap size="middle">
                            <Button danger type="primary" onClick={handleModalCancel}>
                                Hủy
                            </Button>
                            <Button type="primary" onClick={() => onCreate('export')}>
                                Xuất kho
                            </Button>
                        </Space>
                    </Row>
                );
            case 'detail':
                return (
                    <Row justify="center">
                        <Space wrap size="middle">
                            <Popconfirm
                                title="Bạn chắc chắn muốn hủy phiếu?"
                                okText="Có"
                                cancelText="Không"
                                onConfirm={() => onCancelReceipt(detailDataReceipt)}
                                disabled={detailDataReceipt?.status === 'cancel'}
                            >
                                <Button
                                    danger
                                    type="primary"
                                    disabled={detailDataReceipt?.status === 'cancel'}
                                    style={{ marginRight: '5px' }}
                                >
                                    Hủy phiếu
                                </Button>
                            </Popconfirm>
                            <Button type="primary" onClick={onExportPdf}>
                                Xuất phiếu
                            </Button>
                        </Space>
                    </Row>
                );
            default:
                return (
                    <Row justify="space-between">
                        <Popconfirm
                            title="Bạn chắc chắn muốn hủy phiếu?"
                            okText="Có"
                            cancelText="Không"
                            onConfirm={() => onCancelReceipt(detailDataReceipt)}
                            disabled={detailDataReceipt?.status === 'cancel'}
                        >
                            <Button disabled={detailDataReceipt?.status === 'cancel'}>Hủy phiếu</Button>
                        </Popconfirm>
                        <div>
                            <Button onClick={() => setIsModalVisible(false)} style={{ marginRight: '5px' }}>
                                Hủy
                            </Button>
                            <Button type="primary" onClick={() => onUpdateReceipt('order')}>
                                Lưu
                            </Button>
                        </div>
                        <Button type="primary" onClick={() => onUpdateReceipt('import')}>
                            Nhập kho
                        </Button>
                    </Row>
                );
        }
    };

    const onChangeAmountLink = (value: any) => {
        const newLinkWareHouse = linkWareHouse.map((item: any) =>
            item.warehouse_id === inputAmountSelect ? { ...item, quantity: value } : item,
        );
        setLinkWareHouse(newLinkWareHouse);
    };

    const renderLabelTime = (action: string) => {
        switch (action) {
            case 'cancel':
                return {
                    upperCase: 'Hủy',
                    lowerCase: 'hủy',
                };
            case 'order':
                return {
                    upperCase: 'Đặt hàng',
                    lowerCase: 'đặt hàng',
                };
            case 'import':
                return {
                    upperCase: 'Nhập kho',
                    lowerCase: 'nhập kho',
                };
            case 'export':
                return {
                    upperCase: 'Xuất kho',
                    lowerCase: 'xuất kho',
                };
            case 'update':
                return {
                    upperCase: 'Cập nhật',
                    lowerCase: 'cập nhật',
                };
            default:
                return {
                    upperCase: 'Xuất kho',
                    lowerCase: 'xuất kho',
                };
        }
    };

    return (
        <Modal width={800} centered title={title} visible={isModalVisible} onCancel={handleModalCancel} footer={null}>
            <Form layout="vertical" form={form}>
                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item
                            label="Loại phiếu"
                            name="receipt_type"
                            required
                            rules={[{ required: true, message: 'Vui lòng chọn loại phiếu' }]}
                        >
                            <Select
                                placeholder="Chọn loại phiếu"
                                disabled={dataReceipt.type === 'detail'}
                                allowClear
                                showSearch
                            >
                                {receiptTypeList.map((item: { _id: string; name: string }) => (
                                    <Select.Option key={item._id} value={item.name}>
                                        {item.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Mã phiếu" name="code">
                            <Input
                                placeholder="Tự khởi tạo nếu bỏ trống"
                                disabled={dataReceipt.type === 'detail'}
                                allowClear
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item label="Tên phiếu" name="name">
                            <Input placeholder="Nhập tên phiếu" disabled={dataReceipt.type === 'detail'} allowClear />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="File chứng từ">
                            {dataReceipt.type === 'detail' ? (
                                <Typography.Link href={detailDataReceipt?.file} target="_blank">
                                    {detailDataReceipt?.file ? 'Mở file chứng từ' : 'Không có file chứng từ'}
                                </Typography.Link>
                            ) : (
                                <>
                                    <Upload {...uploadProps}>
                                        <Button type="primary" icon={<UploadOutlined />}>
                                            Tải file chứng từ
                                        </Button>
                                    </Upload>
                                    {dataReceipt.type === 'update' && detailDataReceipt?.file && fileList.length === 0 && (
                                        <Typography.Link href={detailDataReceipt.file} target="_blank">
                                            Mở file chứng từ
                                        </Typography.Link>
                                    )}
                                    <p>Lưu ý:</p>
                                    <ul>
                                        <li>Chỉ chấp nhận file ảnh hoặc file pdf.</li>
                                        <li>File tải lên phải nhỏ hơn 1MB.</li>
                                    </ul>
                                </>
                            )}
                        </Form.Item>
                    </Col>
                </Row>
                {detailDataReceipt &&
                    detailDataReceipt?.list_operator?.map((item: any) => {
                        return (
                            <Row style={{ marginBottom: 6 }}>
                                <Col span={12}>
                                    Thời gian {renderLabelTime(item?.action).lowerCase}:{' '}
                                    {moment(item?.time * 1000).format('DD/MM/YYYY HH:mm')}
                                </Col>
                                <Col span={12}>
                                    {renderLabelTime(item?.action).upperCase} bởi: {item?.name}
                                </Col>
                            </Row>
                        );
                    })}
                <br />
                <Form.Item label="Thông tin mặt hàng, nguyên liệu" required>
                    <Input
                        placeholder="Tìm nguyên liệu"
                        value={valueIngredient}
                        onChange={(e) => {
                            setValueIngredient(e.target.value);
                        }}
                        style={{ marginBottom: '24px' }}
                        prefix={<SearchOutlined />}
                        disabled={dataReceipt.type === 'detail'}
                    />
                    {linkWareHouse?.length !== 0 &&
                        linkWareHouse?.map((item: any) => {
                            return (
                                <Row gutter={[24, 24]} key={item?._id} align="middle">
                                    <Col span={6}>{item?.name}</Col>
                                    <Col span={8}>
                                        <InputNumber
                                            onFocus={() =>
                                                setInputAmountSelect(item?.warehouse_id || item?._id || item.id)
                                            }
                                            onChange={(value) => {
                                                onChangeAmountLink(value);
                                            }}
                                            style={{ width: '100%' }}
                                            placeholder="Nhập số lượng"
                                            required
                                            defaultValue={item?.quantity}
                                            disabled={dataReceipt.type === 'detail'}
                                        />
                                    </Col>
                                    <Col span={8}>
                                        <Input disabled value={item?.unit} />
                                    </Col>
                                    {dataReceipt.type !== 'detail' && (
                                        <Col span={2}>
                                            <Tooltip title="Xóa">
                                                <DeleteOutlined
                                                    onClick={() => {
                                                        setLinkWareHouse(
                                                            linkWareHouse.filter(
                                                                (record: any) => record?.name !== item?.name,
                                                            ),
                                                        );
                                                    }}
                                                />
                                            </Tooltip>
                                        </Col>
                                    )}
                                </Row>
                            );
                        })}
                </Form.Item>
                <Form.Item label="Ghi chú" name="desc">
                    <TextArea placeholder="Nhập ghi chú" disabled={dataReceipt.type === 'detail'} />
                </Form.Item>
                {listButton()}
            </Form>
            {valueIngredient && (
                <ModalSearchIngredient
                    isModalSearch={isModalSearch}
                    setIsModalSearch={setIsModalSearch}
                    valueIngredient={valueIngredient}
                    setValueIngredient={setValueIngredient}
                    setLinkWareHouse={setLinkWareHouse}
                    linkWareHouse={linkWareHouse}
                    // eslint-disable-next-line react/jsx-boolean-value
                    haveMultipleTabs={true}
                />
            )}
        </Modal>
    );
};

export default ModalReceipt;
