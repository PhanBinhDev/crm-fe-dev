import { Modal, Form, Input, Select, DatePicker, InputNumber, message, Space, Button, Tooltip } from 'antd';
import { useEffect } from 'react';
import { useModal } from '@/hooks/useModal';
import { useInvalidate, useList } from '@refinedev/core';
import { ActivityService } from '@/services/api/activity';
import { ActivityType, ActivityPriority, ActivityCategory } from '@/common/enum/activity';
import { IStage } from '@/common/types';
import { ISemester } from '@/common/types/semester';
import { IconArrowDownRight, IconPaperclip, IconX, IconDeviceFloppy, IconClock, IconCalendar, IconMapPin, IconLink, IconTag, IconFlag, IconList } from '@tabler/icons-react';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const ModalEditActivity = () => {
  const { data, isOpen, type, closeModal } = useModal();
  const { activity, updateLocalActivity } = data || {};
  const [form] = Form.useForm();
  const invalidate = useInvalidate();

  // Fetch stages for selection
  const { data: stagesData } = useList<IStage>({
    resource: 'stages',
    pagination: { pageSize: 100 },
    sorters: [{ field: 'position', order: 'asc' }],
  });

  // Fetch semesters for selection
  const { data: semestersData } = useList<ISemester>({
    resource: 'semesters',
    pagination: { pageSize: 100 },
    sorters: [{ field: 'position', order: 'asc' }],
  });

  const stages = stagesData?.data || [];
  const semesters = semestersData?.data || [];

  useEffect(() => {
    if (activity && isOpen) {
      form.setFieldsValue({
        name: activity.name,
        description: activity.description,
        type: activity.type,
        priority: activity.priority,
        category: activity.category,
        stageId: activity.stageId,
        semesterId: activity.semester?.id,
        startTime: activity.startTime ? dayjs(activity.startTime) : null,
        endTime: activity.endTime ? dayjs(activity.endTime) : null,
        location: activity.location,
        onlineLink: activity.onlineLink,
        estimateTime: activity.estimateTime,
        mandatory: activity.mandatory,
        position: activity.position,
      });
    }
  }, [activity, isOpen, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      console.log('Form values:', values);
      
      // Chuẩn bị data theo đúng API schema
      const updateData: any = {
        name: values.name,
        position: values.position || activity.position || 0,
        type: values.type || 'task',
        mandatory: values.mandatory || false,
      };

      // Chỉ thêm các trường có giá trị
      if (values.description) updateData.description = values.description;
      if (values.priority) updateData.priority = values.priority;
      if (values.category) updateData.category = values.category;
      if (values.stageId) updateData.stageId = values.stageId;
      if (values.semesterId) updateData.semesterId = values.semesterId;
      if (values.startTime) updateData.startTime = values.startTime.toISOString();
      if (values.endTime) updateData.endTime = values.endTime.toISOString();
      if (values.location) updateData.location = values.location;
      if (values.onlineLink) updateData.onlineLink = values.onlineLink;
      if (values.estimateTime) updateData.estimateTime = values.estimateTime;

      console.log('Update data:', updateData);
      console.log('Activity ID:', activity.id);

      // OPTIMISTIC UPDATE: Cập nhật local state ngay lập tức
      if (updateLocalActivity) {
        updateLocalActivity(activity.id, updateData);
      }
      
      // API call trong background
      const updateResult = await ActivityService.updateActivity(activity.id, updateData);
      console.log('Update result:', updateResult);
      
      message.success('Cập nhật hoạt động thành công');
      closeModal();
    } catch (error: any) {
      console.error('Update activity error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
      });
      
      // Rollback: Khôi phục activity về trạng thái ban đầu
      if (updateLocalActivity) {
        updateLocalActivity(activity.id, activity);
      }
      
      if (error.errorFields) {
        message.error('Vui lòng kiểm tra lại thông tin');
      } else {
        const errorMessage = error.response?.data?.message || error.message || 'Cập nhật hoạt động thất bại';
        message.error(`Lỗi: ${errorMessage}`);
      }
    }
  };

  const handleCancel = () => {
    closeModal();
  };

  if (!activity || !isOpen || type !== 'ModalEditActivity') return null;

  return (
    <Modal
      title={
        <div
          style={{
            padding: '12px 12px 0',
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              fontSize: '16px',
              fontWeight: 600,
              color: '#222',
            }}
          >
            Chỉnh sửa hoạt động
          </div>
          <Space
            style={{
              gap: 4,
            }}
          >
            {/* Minimize draft */}
            <Tooltip title="Thu nhỏ bản nháp">
              <Button
                type="text"
                style={{
                  borderRadius: 8,
                  marginBottom: 2,
                }}
                styles={{
                  icon: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                }}
                icon={
                  <IconArrowDownRight
                    size={15}
                    style={{
                      color: '#888',
                      cursor: 'pointer',
                      transition: 'color 0.2s',
                    }}
                  />
                }
              />
            </Tooltip>

            <Button
              type="text"
              style={{
                borderRadius: '100%',
                marginBottom: 2,
                background: '#0000000a',
              }}
              onClick={handleCancel}
              styles={{
                icon: {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              }}
              icon={
                <IconX
                  size={15}
                  style={{
                    color: '#888',
                    cursor: 'pointer',
                    transition: 'color 0.2s',
                  }}
                />
              }
              onMouseEnter={e => {
                e.currentTarget.style.background = '#f0f0f0';
                e.currentTarget.style.color = '#222';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#0000000a';
                e.currentTarget.style.color = '#888';
              }}
            />
          </Space>
        </div>
      }
      open={isOpen}
      onCancel={handleCancel}
      destroyOnHidden
      width={800}
      style={{ top: 20 }}
      closeIcon={null}
      styles={{
        content: {
          padding: 0,
        },
        body: {
          padding: '12px 24px',
          maxHeight: '70vh',
          overflowY: 'auto',
        },
        footer: {
          padding: 12,
          borderTop: '1px solid #f0f0f0',
        },
      }}
      footer={
        <Space style={{ gap: 6 }}>
          <Tooltip title="Đính kèm tập tin">
            <Button
              type="text"
              style={{
                width: 'fit-content',
                padding: '0 8px',
                color: '#838383',
                gap: 4,
                borderRadius: 8,
              }}
              styles={{
                icon: {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#838383',
                },
              }}
              icon={<IconPaperclip size={16} />}
            />
          </Tooltip>

          <Button
            type="primary"
            onClick={handleOk}
            style={{
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
            icon={<IconDeviceFloppy size={16} />}
          >
            Lưu thay đổi
          </Button>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
      >
        {/* Row 1: Tên hoạt động - Full width */}
        <Form.Item
          name="name"
          label="Tên hoạt động"
          rules={[{ required: true, message: 'Vui lòng nhập tên hoạt động' }]}
        >
          <Input 
            placeholder="Nhập tên hoạt động" 
            style={{ borderRadius: 8 }}
          />
        </Form.Item>

        {/* Row 2: Mô tả - Full width */}
        <Form.Item
          name="description"
          label="Mô tả"
        >
          <TextArea
            rows={2}
            placeholder="Nhập mô tả hoạt động"
            style={{ borderRadius: 8 }}
          />
        </Form.Item>

        {/* Row 3: Loại + Độ ưu tiên */}
        <div style={{ display: 'flex', gap: 12 }}>
          <Form.Item
            name="type"
            label="Loại hoạt động"
            rules={[{ required: true, message: 'Vui lòng chọn loại hoạt động' }]}
            style={{ flex: 1 }}
          >
            <Select 
              placeholder="Chọn loại hoạt động"
              style={{ borderRadius: 8 }}
              suffixIcon={<IconList size={16} />}
            >
              <Option value={ActivityType.TASK}>Nhiệm vụ</Option>
              <Option value={ActivityType.EVENT}>Sự kiện</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="priority"
            label="Độ ưu tiên"
            style={{ flex: 1 }}
          >
            <Select 
              placeholder="Chọn độ ưu tiên"
              style={{ borderRadius: 8 }}
              suffixIcon={<IconFlag size={16} />}
            >
              <Option value={ActivityPriority.LOW}>Thấp</Option>
              <Option value={ActivityPriority.MEDIUM}>Trung bình</Option>
              <Option value={ActivityPriority.HIGH}>Cao</Option>
              <Option value={ActivityPriority.URGENT}>Khẩn cấp</Option>
            </Select>
          </Form.Item>
        </div>

        {/* Row 4: Danh mục + Trạng thái */}
        <div style={{ display: 'flex', gap: 12 }}>
          <Form.Item
            name="category"
            label="Danh mục"
            style={{ flex: 1 }}
          >
            <Select 
              placeholder="Chọn danh mục"
              style={{ borderRadius: 8 }}
              suffixIcon={<IconTag size={16} />}
            >
              <Option value={ActivityCategory.SEMINAR}>Hội thảo</Option>
              <Option value={ActivityCategory.WORKSHOP}>Workshop</Option>
              <Option value={ActivityCategory.TUTOR}>Gia sư</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="stageId"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
            style={{ flex: 1 }}
          >
            <Select 
              placeholder="Chọn trạng thái"
              style={{ borderRadius: 8 }}
              suffixIcon={<IconList size={16} />}
            >
              {stages.map((stage) => (
                <Option key={stage.id} value={stage.id}>
                  {stage.title}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        {/* Row 5: Kỳ học + Bắt buộc */}
        <div style={{ display: 'flex', gap: 12 }}>
          <Form.Item
            name="semesterId"
            label="Kỳ học"
            style={{ flex: 1 }}
          >
            <Select 
              placeholder="Chọn kỳ học" 
              allowClear
              style={{ borderRadius: 8 }}
              suffixIcon={<IconCalendar size={16} />}
            >
              {semesters.map((semester) => (
                <Option key={semester.id} value={semester.id}>
                  {semester.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="mandatory"
            label="Bắt buộc"
            style={{ flex: 1 }}
          >
            <Select 
              placeholder="Chọn trạng thái bắt buộc"
              style={{ borderRadius: 8 }}
            >
              <Option value={true}>Có</Option>
              <Option value={false}>Không</Option>
            </Select>
          </Form.Item>
        </div>

        {/* Row 6: Thời gian bắt đầu + kết thúc */}
        <div style={{ display: 'flex', gap: 12 }}>
          <Form.Item
            name="startTime"
            label="Thời gian bắt đầu"
            style={{ flex: 1 }}
          >
            <DatePicker
              showTime
              format="DD/MM/YYYY HH:mm"
              placeholder="Chọn thời gian bắt đầu"
              style={{ width: '100%', borderRadius: 8 }}
              suffixIcon={<IconClock size={16} />}
            />
          </Form.Item>

          <Form.Item
            name="endTime"
            label="Thời gian kết thúc"
            style={{ flex: 1 }}
          >
            <DatePicker
              showTime
              format="DD/MM/YYYY HH:mm"
              placeholder="Chọn thời gian kết thúc"
              style={{ width: '100%', borderRadius: 8 }}
              suffixIcon={<IconClock size={16} />}
            />
          </Form.Item>
        </div>

        {/* Row 7: Địa điểm + Link trực tuyến */}
        <div style={{ display: 'flex', gap: 12 }}>
          <Form.Item
            name="location"
            label="Địa điểm"
            style={{ flex: 1 }}
          >
            <Input 
              placeholder="Nhập địa điểm" 
              style={{ borderRadius: 8 }}
              prefix={<IconMapPin size={16} style={{ color: '#888' }} />}
            />
          </Form.Item>

          <Form.Item
            name="onlineLink"
            label="Link trực tuyến"
            style={{ flex: 1 }}
          >
            <Input 
              placeholder="Nhập link trực tuyến" 
              style={{ borderRadius: 8 }}
              prefix={<IconLink size={16} style={{ color: '#888' }} />}
            />
          </Form.Item>
        </div>

        {/* Row 8: Thời gian ước tính + Vị trí */}
        <div style={{ display: 'flex', gap: 12 }}>
          <Form.Item
            name="estimateTime"
            label="Thời gian ước tính (phút)"
            style={{ flex: 1 }}
          >
            <InputNumber
              min={0}
              placeholder="Nhập thời gian ước tính"
              style={{ width: '100%', borderRadius: 8 }}
              prefix={<IconClock size={16} style={{ color: '#888' }} />}
            />
          </Form.Item>

          <Form.Item
            name="position"
            label="Vị trí"
            style={{ flex: 1 }}
          >
            <InputNumber
              min={0}
              placeholder="Nhập vị trí"
              style={{ width: '100%', borderRadius: 8 }}
            />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

export default ModalEditActivity;
