import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useReactToPrint } from 'react-to-print';
import QRCode from 'qrcode.react';
import { ApplicationState } from 'reduxStore/store';
import { getDepartment } from 'reduxStore/department/actions';
import {
    createDepartment,
    updateDepartment,
    deleteDepartment,
    createSubDepartment,
    updateSubDepartment,
    deleteSubDepartment,
} from 'api/store';
import { CreateDepartmentType, CreateSubDepartmentType, DepartmentDataType, SubDepartmentDataType } from 'api/types';
import {
    Table,
    Typography,
    Button,
    Form,
    Input,
    InputNumber,
    Switch,
    Collapse,
    Space,
    Popconfirm,
    message as messageAntd,
    Avatar,
    Spin,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, QrcodeOutlined } from '@ant-design/icons';
import Modal from 'components/admin/Modal';
import { parseCookies } from 'nookies';
import { isEmpty } from 'lodash';
import moment from 'moment';
import PrintQRCode from 'components/admin/PrintQRCode';
import { ColumnsType } from 'antd/lib/table/interface';

const { Title } = Typography;
const { Panel } = Collapse;

const { group_ws } = parseCookies();

const downloadQR = (id: string, active: boolean) => {
    if (!active) {
        return;
    }
    const canvas = document.getElementById(id) as HTMLCanvasElement;
    const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `${id}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
};

const columns: (
    onEdit: (subDepartment: SubDepartmentDataType) => void,
    onDelete: (subDepartment: SubDepartmentDataType) => void,
) => ColumnsType<SubDepartmentDataType> = (onEdit, onDelete) => [
    {
        title: 'Tên',
        dataIndex: 'name',
        key: 'name',
        render: (text: string, record: SubDepartmentDataType) => (
            <Space align="center">
                <QRCode
                    size={200}
                    includeMargin
                    style={{ width: 32, height: 32, cursor: 'pointer' }}
                    id={record.id}
                    onClick={() => downloadQR(record.id, record.active)}
                    fgColor="#0fa44a"
                    value={`${process.env.API_URL}/welcome?q=${record.id}`}
                />
                <a href={`/welcome?q=${record.id}`} rel="noreferrer" target="_blank">
                    {text}
                </a>
                {!record.active && (
                    <Avatar src="https://s3.kstorage.vn/qrpayment/common/close-store.png" shape="square" />
                )}
            </Space>
        ),
    },
    {
        title: 'Mô tả',
        dataIndex: 'desc',
        key: 'desc',
        responsive: ['xl'],
    },
    {
        title: 'Số ghế / chỗ ngồi',
        dataIndex: 'chair',
        key: 'chair',
        sorter: (a: { chair: number }, b: { chair: number }) => a.chair - b.chair,
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
        render: (_text: string, record: SubDepartmentDataType) => (
            <Space>
                <Button onClick={() => onEdit(record)} size="small" type="primary" icon={<EditOutlined />}>
                    Sửa
                </Button>
                <Popconfirm
                    title="Bạn chắc chắn muốn xoá bàn?"
                    okText="Có"
                    cancelText="Không"
                    onConfirm={() => onDelete(record)}
                >
                    <Button danger size="small" icon={<DeleteOutlined />}>
                        Xoá
                    </Button>
                </Popconfirm>
            </Space>
        ),
    },
];

const Department = () => {
    const dispatch = useDispatch();
    const { tokenqr, group_id, store_id } = parseCookies();
    const [form] = Form.useForm();
    const [formSub] = Form.useForm();
    const {
        result: { data: dataDepartment, errorCode: errorCodeDepartment },
        loading: LoadingDepartment,
    } = useSelector((state: ApplicationState) => state.department);

    useEffect(() => {
        dispatch(getDepartment(group_id, store_id, tokenqr));
    }, []);

    const [isShowModal, setIsShowModal] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const handleModal = () => {
        setIsShowModal(!isShowModal);
    };

    const [updateDepartmentState, setUpdateDepartmentState] = useState<DepartmentDataType | null>(null);

    const onEdit = (department: DepartmentDataType) => {
        setIsShowModal(true);
        setUpdateDepartmentState(department);
    };

    const onDelete = async (department: DepartmentDataType) => {
        try {
            messageAntd.loading(`Đang xoá phòng ${department.name}`);
            await deleteDepartment(department._id, group_id, store_id);
            dispatch(getDepartment(group_id, store_id));
            messageAntd.success('Xoá thành công!');
        } catch (err) {
            messageAntd.error((err as Error).message);
        }
    };

    const [isShowModalSub, setIsShowModalSub] = useState<boolean>(false);

    const handleModalSub = () => {
        setIsShowModalSub(!isShowModalSub);
    };

    const [departmentIDState, setDepartmentIDState] = useState<string>('');

    const [updateSubDepartmentState, setUpdateSubDepartmentState] = useState<SubDepartmentDataType | null>(null);

    const onEditSub = (subDepartment: SubDepartmentDataType) => {
        setIsShowModalSub(true);
        setUpdateSubDepartmentState(subDepartment);
    };

    const onDeleteSub = async (subDepartment: SubDepartmentDataType) => {
        try {
            messageAntd.loading(`Đang xoá bàn ${subDepartment.name}`);
            await deleteSubDepartment(subDepartment._id, group_id, store_id);
            dispatch(getDepartment(group_id, store_id));
            messageAntd.success('Xoá thành công!');
        } catch (err) {
            messageAntd.error((err as Error).message);
        }
    };

    const onSubmit = async (values: CreateDepartmentType) => {
        try {
            setLoading(true);
            if (updateDepartmentState) {
                await updateDepartment({ ...values, group_id, store_id }, updateDepartmentState._id);
            } else {
                await createDepartment({ ...values, group_id, store_id });
            }
            dispatch(getDepartment(group_id, store_id));
            setIsShowModal(false);
            setLoading(false);
            messageAntd.success(updateDepartmentState ? 'Sửa thành công!' : 'Thêm mới thành công!');
        } catch (err) {
            setLoading(false);
            messageAntd.error((err as Error).message);
        }
    };

    const genExtra = (item: DepartmentDataType) => (
        <div
            onClick={(event) => {
                event.stopPropagation();
            }}
        >
            <Button
                size="small"
                type="primary"
                onClick={() => {
                    onEdit(item);
                }}
                icon={<EditOutlined />}
            />

            <Space style={{ marginLeft: 10 }}>
                <Popconfirm
                    title={`Bạn chắc chắn muốn xoá ${item.name}`}
                    okText="Có"
                    cancelText="Không"
                    onConfirm={() => onDelete(item)}
                >
                    <Button size="small" danger icon={<DeleteOutlined />} />
                </Popconfirm>
            </Space>
        </div>
    );

    const onSubmitSub = async (values: CreateSubDepartmentType) => {
        try {
            setLoading(true);
            if (updateSubDepartmentState) {
                await updateSubDepartment(
                    { ...values, group_id, store_id, department_id: updateSubDepartmentState.department_id },
                    updateSubDepartmentState._id,
                );
            } else {
                await createSubDepartment({ ...values, group_id, store_id, department_id: departmentIDState });
            }
            dispatch(getDepartment(group_id, store_id));
            setIsShowModalSub(false);
            setLoading(false);
            messageAntd.success(updateSubDepartmentState ? 'Sửa thành công!' : 'Thêm mới thành công!');
        } catch (err) {
            setLoading(false);
            messageAntd.error((err as Error).message);
        }
    };

    useEffect(() => {
        form.resetFields();
        if (!isShowModal) setUpdateDepartmentState(null);
    }, [isShowModal]);

    useEffect(() => {
        formSub.resetFields();
        if (!isShowModalSub) {
            setUpdateSubDepartmentState(null);
            setDepartmentIDState('');
        }
    }, [isShowModalSub]);

    const componentRef = useRef(null);
    const [printQRCodeClick, setPrintQRCodeClick] = useState<number>(0);
    const [printQRData, setPrintQRData] = useState<SubDepartmentDataType[]>([]);
    const [printQRHeader, setPrintQRHeader] = useState<string>('');

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });

    useEffect(() => {
        if (printQRCodeClick && !isEmpty(printQRData) && printQRHeader && typeof handlePrint === 'function')
            handlePrint();
    }, [printQRData, printQRHeader, printQRCodeClick]);

    return (
        <div className="site-layout-background">
            <Space direction="vertical" size="middle">
                <Space align="center" size="middle" wrap>
                    <Title level={2} className="margin-bottom-0">
                        Quản lý phòng / bàn
                    </Title>
                    <Button onClick={handleModal} type="primary" icon={<PlusOutlined />}>
                        Thêm mới phòng / tầng
                    </Button>
                </Space>
                <Spin spinning={LoadingDepartment}>
                    <Collapse accordion>
                        {!errorCodeDepartment &&
                            dataDepartment?.map((item) => (
                                <Panel
                                    header={
                                        <Space align="center">
                                            {item.name}
                                            {!item.active && (
                                                <Avatar
                                                    src="https://s3.kstorage.vn/qrpayment/common/close-store.png"
                                                    shape="square"
                                                />
                                            )}
                                        </Space>
                                    }
                                    key={item._id}
                                    extra={genExtra(item)}
                                >
                                    <Space direction="vertical" size="middle">
                                        <Space wrap size="middle">
                                            <Button
                                                onClick={() => {
                                                    setDepartmentIDState(item._id);
                                                    handleModalSub();
                                                }}
                                                type="primary"
                                                icon={<PlusOutlined />}
                                            >
                                                Thêm mới bàn
                                            </Button>
                                            <Button
                                                type="primary"
                                                icon={<QrcodeOutlined />}
                                                onClick={() => {
                                                    setPrintQRData(item.subDepartment);
                                                    setPrintQRHeader(item.name);
                                                    setPrintQRCodeClick(
                                                        (prevPrintQRCodeClick) => prevPrintQRCodeClick + 1,
                                                    );
                                                }}
                                            >
                                                In QR-Code
                                            </Button>
                                        </Space>
                                        <Table
                                            size="small"
                                            columns={columns(onEditSub, onDeleteSub)}
                                            dataSource={item.subDepartment}
                                            pagination={false}
                                            rowKey="_id"
                                        />
                                    </Space>
                                </Panel>
                            ))}
                    </Collapse>
                </Spin>
                <div style={{ display: 'none' }}>
                    <PrintQRCode ref={componentRef} header={printQRHeader} data={printQRData} group_ws={group_ws} />
                </div>
            </Space>

            <Modal isShowModal={isShowModal} hideModal={handleModal}>
                <Form
                    form={form}
                    name="basic"
                    layout="vertical"
                    initialValues={
                        updateDepartmentState || {
                            active: true,
                            order: 1,
                        }
                    }
                    onFinish={onSubmit}
                >
                    <Form.Item label="Tên" name="name" required>
                        <Input required />
                    </Form.Item>
                    <Form.Item label="Mô tả" name="desc">
                        <Input />
                    </Form.Item>
                    <Form.Item label="Trạng thái" name="active" valuePropName="checked" tooltip="Khoá/mở phòng / tầng">
                        <Switch />
                    </Form.Item>
                    <Form.Item
                        label="Thứ tự hiển thị"
                        name="order"
                        tooltip="Thự tự hiển thị vị trí của sản phẩm ở trang khách đặt món"
                    >
                        <InputNumber
                            formatter={(value) => {
                                if (Number(value) < 1) return '1';
                                return `${value}`.replace(/\D/, '');
                            }}
                            min={1}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                    <Button block type="primary" htmlType="submit" loading={loading}>
                        Lưu
                    </Button>
                </Form>
            </Modal>

            <Modal isShowModal={isShowModalSub} hideModal={handleModalSub}>
                <Form
                    form={formSub}
                    name="basic"
                    layout="vertical"
                    initialValues={
                        updateSubDepartmentState || {
                            active: true,
                            chair: 1,
                            order: 1,
                        }
                    }
                    onFinish={onSubmitSub}
                >
                    <Form.Item label="Tên" name="name" required>
                        <Input required />
                    </Form.Item>
                    <Form.Item label="Mô tả" name="desc">
                        <Input />
                    </Form.Item>
                    <Form.Item label="Trạng thái" name="active" valuePropName="checked" tooltip="Khoá/mở bàn">
                        <Switch />
                    </Form.Item>
                    <Form.Item label="Số ghế / Số chỗ ngồi" name="chair" required>
                        <InputNumber
                            formatter={(value) => {
                                if (Number(value) < 1) return '1';
                                return `${value}`.replace(/\D/, '');
                            }}
                            min={1}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                    <Form.Item label="Thứ tự" name="order">
                        <InputNumber
                            formatter={(value) => {
                                if (Number(value) < 1) return '1';
                                return `${value}`.replace(/\D/, '');
                            }}
                            min={1}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                    <Button block type="primary" htmlType="submit" loading={loading}>
                        Lưu
                    </Button>
                </Form>
            </Modal>
        </div>
    );
};
export default Department;
