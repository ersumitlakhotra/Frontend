import { Button, DatePicker, Divider, Drawer, Input, Select, Space, Tabs, Tag } from "antd";
import { DownloadOutlined, PlusOutlined, SearchOutlined, SaveOutlined, ClockCircleOutlined } from '@ant-design/icons';
import OrderTable from "../../components/Order/order_table.js"
import { useEffect, useRef, useState } from "react";
import useAlert from "../../common/alert";
import { apiCalls } from "../../hook/apiCall";
import OrderDetail from "../../components/Order/order_detail";
import { getTabItems } from "../../common/items.js";
import Heading from "../../common/heading.js";

import Chart from "react-apexcharts";
import { SiTicktick } from "react-icons/si";
import { MdOutlineAssignmentInd } from "react-icons/md";
import { AvailableCard, WorkingCard } from "../../components/Order/card.js";
import OrderTabs from "../../components/Order/tab.js";

const customeLabelTab = (label, tagColor, tagValue) => {
    return (
        <div class='flex flex-row gap-2 items-center'>
            <p>{label}</p>
            <Tag color={tagColor}>{tagValue}</Tag>
        </div>
    )
}

const Order = ({ orderList, serviceList, tabActiveKey, setTabActiveKey, }) => {
    const ref = useRef();
    const tabItems = [
        getTabItems('1', customeLabelTab("All", "blue", "5"), null, <OrderTabs orderList={orderList} serviceList={serviceList} />),
        getTabItems('2', customeLabelTab("Pending", "yellow", "10"), null, <OrderTabs />),
        getTabItems('3', customeLabelTab("Completed", "green", "10"), null, <OrderTabs />),
        getTabItems('4', customeLabelTab("Cancelled", "red", "10"), null, <OrderTabs />),
    ];
    const { contextHolder, success, error } = useAlert();
    const [dataList, setDataList] = useState([]);
    const [servicesList, setServicesList] = useState([]);
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState('New');
    const [id, setId] = useState(0);
    const [refresh, setRefresh] = useState(0);

    const [isLoading, setIsLoading] = useState(false);
    const [isFilter, setIsFilter] = useState(true);

    useEffect(() => {
        getData();
    }, []);

    const getData = async () => {
        setIsLoading(true);
        try {
            const res = await apiCalls('GET', 'order', null, null);
            setDataList(res.data.data);

            const res1 = await apiCalls('GET', 'services', null, null);
            setServicesList(res1.data.data);
        }
        catch (e) {
            error(error.message)
        }
        setIsLoading(false);
    }

    const btnNew_Click = () => {
        setTitle("New Order");
        setRefresh(refresh + 1);
        setId(0);
        setOpen(true);
    }

    const btnEdit_Click = (id) => {
        setTitle("Edit Order");
        setRefresh(refresh + 1);
        setId(id);
        setOpen(true);
    }

    const btnSave = async () => {
        const result = await ref.current?.btnSave_Click();
        setOpen(false);
        getData();
        if (result.status === 500 || result.status === 404)
            error(result.message);
        if (result.status === 201)
            success(`The order has been successfully created.`);
        if (result.status === 200)
            success(`The order has been modified successfully.`);
    }
    return (
        <div class="flex flex-col gap-4 mb-12">

            <div class='flex items-center justify-between'>
                <span class="text-lg font-semibold text-gray-800">Order</span>
                <div class="flex gap-2">
                    <Button type='default' icon={<DownloadOutlined />} size="large">Export</Button>
                    <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => btnNew_Click(0)}>Create order</Button>
                </div>
            </div>

            <div class='flex flex-col gap-2 md:flex-row '>
                <div class='w-full bg-white border rounded p-2'>
                    <Heading label={"Working"} desc={"4 order is in progress "} icon={<SiTicktick size={26}/>} />
                    <div class='mx-8 my-2 overflow-scroll overflow-y-hidden flex flex-row gap-4 p-2'>
                        <WorkingCard key={1} />
                    </div>
                </div>
                <div class='w-full bg-white border rounded p-2'>
                    <Heading label={"Available"} desc={"Sort of ready and able to take on new tasks"} icon={<MdOutlineAssignmentInd size={26} />} />
                    <div class='mx-8 my-2 overflow-scroll overflow-y-hidden flex flex-row gap-4 p-2 pb-14'>
                        <AvailableCard key={1} />
                    </div>
                </div>
            </div>

                <Tabs items={tabItems} activeKey={tabActiveKey} onChange={(e) => { setTabActiveKey(e) }} />
        
            {
                !isLoading && //<p>Table</p>
                <OrderTable dataSource={dataList} serviceList={servicesList} onEdit={(e) => btnEdit_Click(e)} />
            }

            {/* Drawer on right*/}
            <Drawer title={title} placement='right' width={500} onClose={() => setOpen(false)} open={open}
                extra={<Space><Button type="primary" icon={<SaveOutlined />} onClick={btnSave} >Save</Button></Space>}>

                <OrderDetail id={id} reload={refresh} ref={ref} />
            </Drawer>

            {contextHolder}
        </div>
    )
}

export default Order;