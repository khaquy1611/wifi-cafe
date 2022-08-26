import React, { useState, useEffect } from 'react';
import {
    Typography,
    Button,
    notification,
    Tabs,
    Col,
    Row,
    Input,
    Modal,
    Form,
    Tag,
    Space,
    Popconfirm,
    Upload,
    message,
    Tooltip,
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    EditOutlined,
    DownloadOutlined,
    UploadOutlined,
    InboxOutlined,
    PlusCircleOutlined,
    MinusCircleOutlined,
} from '@ant-design/icons';
import {
    createInventoryApi,
    deleteInventoryApi,
    getInventoryApi,
    imPortInventory,
    updateInventoryApi,
} from 'api/inventory';
import { parseCookies } from 'nookies';
import * as XLSX from 'xlsx';
import pickBy from 'lodash/pickBy';
import identity from 'lodash/identity';
import { ImportDataExcel, IngredientType } from 'api/types';
import { RcFile, UploadProps } from 'antd/lib/upload/interface';
import ModalReceipt from 'components/admin/inventory/ModalReceipt';
import FormFilterInventory from 'components/admin/inventory/FormFilterInventory';
import TableInventory from 'components/admin/inventory/TableInventory';
import axios from 'axios';

const { Title } = Typography;
const { Dragger } = Upload;
type Values = {
    name: string;
    status: string;
};
const Inventory: React.FC = () => {
    const [form] = Form.useForm();
    const [formSearch] = Form.useForm();
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [fileNameList, setfileNameList] = useState<RcFile[]>([]);
    const [isShowModal, setIsShowModal] = useState<boolean>(false);
    const [isShowModalContent, setIsShowModalContent] = useState<boolean>(false);
    const [ware_houses, setIngredient] = useState<ImportDataExcel[]>([]);
    const [isModalVisibleAddAndEdit, setIsModalVisibleAddAndEdit] = useState<boolean>(false);
    const [updateRecord, setUpdateRecord] = useState<IngredientType>();
    const [tabs, setTabs] = useState<string>('ingredient');
    const [isShowModalReceipt, setIsShowModalReceipt] = useState<boolean>(false);
    const [dataModalReceipt, setDataModalReceipt] = useState({
        type: 'add_import',
    } as {
        type: 'add_import' | 'add_export';
        initWarehouse?: IngredientType;
    });
    const { group_id, store_id } = parseCookies();
    const [query, setQuery] = useState({
        page: 1,
        limit: 10,
        group_id,
        store_id,
        type: 'ingredient',
    } as {
        page: number;
        limit: number;
        group_id: string;
        store_id: string;
        name?: string;
        status?: string;
        type: string;
        exports?: string;
    });

    const { status } = query;
    const exportToCSV = async () => {
        try {
            if (!dataSource.length) {
                message.error('Không có dữ liệu');
                return;
            }
            axios({
                url: `${process.env.API_URL}/api/ware-house/export`,
                method: 'GET',
                responseType: 'blob',
                params: {
                    type: tabs,
                    status,
                    group_id,
                    store_id,
                },
                withCredentials: process.env.APP_DEBUG === 'production',
            }).then((response: { data: BlobPart }) => {
                const fileURL = window.URL.createObjectURL(new Blob([response.data]));
                const fileLink = document.createElement('a');

                fileLink.href = fileURL;
                fileLink.setAttribute('download', 'danh_sach_nguyen_vat_lieu_ton_kho.xlsx');
                document.body.appendChild(fileLink);

                fileLink.click();
            });
        } catch (err) {
            message.error((err as Error).message);
        }
    };

    const submitImportIngredient = async () => {
        try {
            if (ware_houses.length === 0) {
                message.warn('Danh sách nguyên liệu trống');
                return;
            }
            setLoading(true);
            const { message: messageImport } = await imPortInventory({ ware_houses, group_id, store_id });
            if (messageImport === 'success') {
                setIsShowModal(false);
                setLoading(false);
                message.success('Thêm mới nguyên liệu bằng file excel thành công!');
                fetchRecords();
            }
        } catch (err) {
            setLoading(false);
            message.error((err as Error).message);
        }
    };

    const onSubmitForm = async () => {
        form.validateFields().then(async (values) => {
            try {
                if (updateRecord) {
                    const data = await updateInventoryApi((updateRecord as IngredientType)._id, {
                        group_id,
                        store_id,
                        name: values.name || updateRecord.name,
                        unit: values.unit || updateRecord.unit,
                        min_amount: values.min_amount || 0,
                    });
                    if (data.message === 'success') {
                        notification.success({
                            message: 'Sửa thành công',
                        });
                        setIsModalVisibleAddAndEdit(false);
                        form.resetFields();
                        setQuery({ ...query });
                    }
                } else {
                    const data = await createInventoryApi({
                        group_id,
                        store_id,
                        type: 'ingredient',
                        name: values.name,
                        unit: values.unit,
                        min_amount: values.min_amount || 0,
                        amount: values.amount || 0,
                        _id: values._id,
                    });
                    if (data.message === 'success') {
                        notification.success({
                            message: 'Tạo nguyên liệu thành công',
                        });
                        setIsModalVisibleAddAndEdit(false);
                        form.resetFields();
                        setQuery({ ...query, page: 1 });
                    }
                }
            } catch (err) {
                notification.error({
                    message: (err as Error).message,
                });
            }
        });
    };

    const onSearchFormFilterIngredient = (value: Values) => {
        const values = pickBy(value, identity);
        const { name, status } = values;
        setQuery({ ...query, name, status, page: 1 });
    };

    const onChangeTab = (key: string) => {
        setTabs(key);
        formSearch.resetFields();
        delete query.status;
        delete query.name;
        setQuery({ ...query, page: 1, limit: 10 });
    };

    const fetchRecords = async () => {
        setLoading(true);
        try {
            const { data, total } = await getInventoryApi({ ...query, type: tabs });
            setDataSource(data);
            setTotalPages(total);
        } catch (err) {
            notification.error({
                message: (err as Error).message,
            });
        }
        setLoading(false);
    };

    const onUpdate = (record: IngredientType) => {
        setUpdateRecord(record);
        form.setFieldsValue({
            name: record.name,
            min_amount: record.min_amount,
            unit: record.unit,
            amount: record.amount,
        });
        setIsModalVisibleAddAndEdit(true);
    };

    const onDelete = async (record: { _id: string }) => {
        try {
            const data = await deleteInventoryApi(record._id, {
                group_id,
                store_id,
            });
            if (data.message === 'success') {
                notification.success({
                    message: 'Xoá thành công',
                });
                setQuery({ ...query, page: 1 });
            }
        } catch (err) {
            notification.error({
                message: (err as Error).message,
            });
        }
    };

    useEffect(() => {
        fetchRecords();
    }, [query, tabs]);

    const handleShowModalAdd = () => {
        setIsModalVisibleAddAndEdit(!isModalVisibleAddAndEdit);
        form.resetFields();
        setUpdateRecord(undefined);
    };

    const handleModalCancel = () => {
        setIsModalVisibleAddAndEdit(false);
    };

    const handleModal = () => {
        setIsShowModal(false);
    };

    const fileProps: UploadProps = {
        name: 'file',
        fileList: fileNameList,
        onChange(info) {
            const { status } = info.file;
            if (status === 'done') {
                message.success(`Tệp ${info.file.name} tải lên thành công`);
            } else if (status === 'error') {
                message.error(`Tệp ${info.file.name} tải lên thất bại`);
            } else {
                message.success(`Tệp ${info.file.name} đâ bị xóa`);
                setfileNameList([]);
            }
        },
    };

    const onImport = (record: IngredientType) => {
        setIsShowModalReceipt(true);
        setDataModalReceipt({
            type: 'add_import',
            initWarehouse: record,
        });
    };

    const onExport = (record: IngredientType) => {
        setIsShowModalReceipt(true);
        setDataModalReceipt({
            type: 'add_export',
            initWarehouse: record,
        });
    };

    const columns = [
        {
            title: <b>{`Tên ${tabs === 'item' ? 'sản phẩm' : 'nguyên liệu'}`}</b>,
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: <b>Đơn vị</b>,
            dataIndex: 'unit',
            key: 'unit',
        },
        {
            title: <b>SL tối thiểu</b>,
            dataIndex: 'min_amount',
            key: 'min_amount',
        },
        {
            title: <b>SL tồn cuối</b>,
            dataIndex: 'remainAmount',
            key: 'remainAmount',
            render: (dataNumber: number) => {
                return dataNumber?.toLocaleString('en-US');
            },
        },
        {
            title: <b>Trạng thái</b>,
            dataIndex: 'status',
            key: 'status',
            render: (text: string) => {
                let status = '';
                if (text === 'low') {
                    status = 'Sắp Hết Hàng';
                } else if (text === 'empty') {
                    status = 'Hết Hàng';
                } else {
                    status = 'Còn Hàng';
                }
                return (
                    <Tag color={text === 'empty' ? 'red' : text === 'low' ? 'orange' : 'green'}>
                        {status.toUpperCase()}
                    </Tag>
                );
            },
        },
        {
            title: '',
            key: 'action',
            dataIndex: 'action',
            render: (_text: string, record: IngredientType) => (
                <Space>
                    <Button size="small" type="primary" icon={<EditOutlined />} onClick={() => onUpdate(record)}>
                        Sửa
                    </Button>
                    <Popconfirm
                        title={
                            tabs === 'item' ? 'Liên kết kho hàng của sản phẩm sẽ bị xóa!' : 'Bạn chắc chắn muốn xoá?'
                        }
                        okText="Có"
                        cancelText="Không"
                        onConfirm={() => onDelete(record)}
                    >
                        <Button danger size="small" icon={<DeleteOutlined />}>
                            Xoá
                        </Button>
                    </Popconfirm>
                    <Tooltip title="Nhập kho">
                        <PlusCircleOutlined style={{ fontSize: 20 }} onClick={() => onImport(record)} />
                    </Tooltip>
                    <Tooltip title="Xuất kho">
                        <MinusCircleOutlined style={{ fontSize: 20 }} onClick={() => onExport(record)} />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <>
            <div className="site-layout-background">
                <Space direction="vertical" size="middle">
                    <Space align="center" size="middle" wrap>
                        <Title level={2} className="margin-bottom-0">
                            {`Danh sách ${tabs === 'item' ? 'sản phẩm' : 'nguyên liệu'}`}
                        </Title>
                        {tabs === 'ingredient' && (
                            <Button onClick={handleShowModalAdd} type="primary" icon={<PlusOutlined />}>
                                Thêm mới
                            </Button>
                        )}
                    </Space>
                    <Space align="center" size="middle" wrap>
                        <Button type="primary" onClick={exportToCSV} icon={<DownloadOutlined />}>
                            Xuất danh sách
                        </Button>
                        {tabs === 'ingredient' && (
                            <Button
                                onClick={() => {
                                    setIsShowModalContent(true);
                                    setIsShowModal(true);
                                }}
                                type="primary"
                                icon={<UploadOutlined />}
                            >
                                Nhập danh sách
                            </Button>
                        )}
                    </Space>
                    <Tabs defaultActiveKey="ingredient" onChange={onChangeTab}>
                        <Tabs.TabPane tab="Nguyên liệu" key="ingredient" />
                        <Tabs.TabPane tab="Hàng tồn" key="item" />
                    </Tabs>
                    <FormFilterInventory
                        form={formSearch}
                        onSearchFormFilterIngredient={onSearchFormFilterIngredient}
                    />
                    <TableInventory
                        loading={loading}
                        columns={columns}
                        query={query}
                        setQuery={setQuery}
                        dataSource={dataSource}
                        totalPages={totalPages}
                    />
                </Space>
            </div>
            <Modal
                centered
                title={`${updateRecord ? 'Sửa' : 'Thêm'} ${updateRecord?.type === 'item' ? 'sản phẩm' : 'nguyên liệu'}`}
                visible={isModalVisibleAddAndEdit}
                onCancel={handleModalCancel}
                footer={null}
            >
                <Form layout="vertical" form={form}>
                    {updateRecord?.type !== 'item' && (
                        <Row gutter={24}>
                            <Col span={12}>
                                <Form.Item
                                    label="Tên nguyên liệu"
                                    required
                                    rules={[{ required: true, message: 'Vui lòng nhập tên nguyên liệu' }]}
                                    name="name"
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Đơn vị"
                                    required
                                    rules={[{ required: true, message: 'Vui lòng nhập đơn vị' }]}
                                    name="unit"
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                        </Row>
                    )}
                    <Row gutter={24}>
                        {!updateRecord && (
                            <Col span={12}>
                                <Form.Item
                                    label="Số lượng ban đầu"
                                    name="amount"
                                    rules={[
                                        {
                                            pattern: /^[+-]?\d+(\.\d{0,3})?$/,
                                            message: 'Vui lòng nhập số hợp lệ',
                                        },
                                    ]}
                                >
                                    <Input placeholder="0" disabled={updateRecord} />
                                </Form.Item>
                            </Col>
                        )}
                        <Col span={12}>
                            <Form.Item
                                label="Số lượng tối thiểu"
                                name="min_amount"
                                rules={[
                                    {
                                        pattern: /^[+-]?\d+(\.\d{0,3})?$/,
                                        message: 'Vui lòng nhập số hợp lệ',
                                    },
                                ]}
                            >
                                <Input placeholder="0" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Button block key="submit" type="primary" onClick={onSubmitForm}>
                        Lưu
                    </Button>
                </Form>
            </Modal>
            <Modal centered maskClosable={false} footer={null} visible={isShowModal} onCancel={handleModal}>
                {isShowModalContent && (
                    <Space direction="vertical" size="large">
                        <p>Tải file excel lên</p>
                        <Dragger
                            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                            beforeUpload={(file: RcFile) => {
                                setfileNameList((prev) => [...prev, file]);
                                return new Promise(() => {
                                    const reader: FileReader = new FileReader();
                                    reader.readAsArrayBuffer(file);
                                    reader.onload = () => {
                                        const bufferArray = reader.result;
                                        const wb = XLSX.read(bufferArray, { type: 'buffer' });
                                        const wsname = wb.SheetNames[0];
                                        const ws = wb.Sheets[wsname];
                                        const data = XLSX.utils.sheet_to_json(ws);
                                        const newDatasConvert = data.map((item: any) => {
                                            return {
                                                name: item['Tên nguyên liệu'],
                                                type: 'ingredient',
                                                amount: item['Số lượng'],
                                                min_amount: item['Số lượng tối thiểu'],
                                                unit: item['Đơn vị'],
                                            };
                                        });
                                        setIngredient(newDatasConvert);
                                    };
                                });
                            }}
                            {...fileProps}
                        >
                            <p className="ant-upload-drag-icon">
                                <InboxOutlined />
                            </p>
                            <p className="ant-upload-text">Kéo hoặc upload file excel tại đây</p>
                        </Dragger>
                        <div>
                            <p>
                                Tải file mẫu nhập danh sách nguyên liệu{' '}
                                <a href="/FileMauNguyenLieu.xlsx" download>
                                    tại đây
                                </a>
                            </p>
                            <p>Lưu ý:</p>
                            <ul>
                                <li>
                                    Thao tác nhập danh sách sẽ tạo mới dữ liệu, không có tác dụng cập nhật dữ liệu cũ.
                                </li>
                                <li>
                                    Các nguyên liệu trùng tên sẽ không được nhập vào danh sách nguyên liệu của nhà hàng.
                                </li>
                                <li>Số lượng bản ghi không quá 200.</li>
                            </ul>
                        </div>
                        <Button block type="primary" onClick={submitImportIngredient} loading={loading}>
                            Lưu
                        </Button>
                    </Space>
                )}
            </Modal>
            <ModalReceipt
                isModalVisible={isShowModalReceipt}
                setIsModalVisible={setIsShowModalReceipt}
                dataReceipt={dataModalReceipt}
                reloadList={() => setQuery({ ...query })}
            />
        </>
    );
};

export default Inventory;
