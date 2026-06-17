<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import dayjs from 'dayjs'
import type { FormInstance, FormRules } from 'element-plus'
import type { BookRecord, BookRecordForm, BookCondition, PurchaseChannel } from '@/types/book'
import { CONDITION_OPTIONS, PURCHASE_CHANNEL_OPTIONS } from '@/types/book'

const props = defineProps<{
  visible: boolean
  record?: BookRecord | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  submit: [form: BookRecordForm]
}>()

const defaultForm = (): BookRecordForm => ({
  title: '',
  author: '',
  price: 0,
  condition: '良好' as BookCondition,
  note: '',
  date: dayjs().format('YYYY-MM-DD'),
  purchaseChannel: undefined as PurchaseChannel | undefined,
})

const form = reactive<BookRecordForm>(defaultForm())

const formRef = ref<FormInstance>()

const rules: FormRules = {
  title: [{ required: true, message: '请输入书名', trigger: 'blur' }],
  author: [{ required: true, message: '请输入作者', trigger: 'blur' }],
  price: [{ required: true, message: '请输入购入价', trigger: 'blur' }],
  condition: [{ required: true, message: '请选择品相', trigger: 'change' }],
  date: [{ required: true, message: '请选择日期', trigger: 'change' }],
}

/** 弹窗标题 */
const dialogTitle = () => (props.record ? '编辑记录' : '新增记录')

/** 重置表单 */
function resetForm() {
  Object.assign(form, defaultForm())
}

/** 监听编辑数据回填 */
watch(
  () => props.visible,
  (val) => {
    if (val && props.record) {
      Object.assign(form, {
        title: props.record.title,
        author: props.record.author,
        price: props.record.price,
        condition: props.record.condition,
        note: props.record.note,
        date: props.record.date,
        purchaseChannel: props.record.purchaseChannel,
      })
    } else if (val) {
      resetForm()
    }
  }
)

/** 关闭弹窗 */
function handleClose() {
  emit('update:visible', false)
}

/** 提交表单 */
async function handleSubmit() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  emit('submit', { ...form })
  handleClose()
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    :title="dialogTitle()"
    width="520px"
    destroy-on-close
    @update:model-value="emit('update:visible', $event)"
    @closed="resetForm"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="书名" prop="title">
        <el-input v-model="form.title" placeholder="请输入书名" />
      </el-form-item>
      <el-form-item label="作者" prop="author">
        <el-input v-model="form.author" placeholder="请输入作者" />
      </el-form-item>
      <el-form-item label="购入价" prop="price">
        <el-input-number
          v-model="form.price"
          :min="0"
          :precision="2"
          :step="1"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="品相" prop="condition">
        <el-select v-model="form.condition" placeholder="请选择品相" style="width: 100%">
          <el-option
            v-for="item in CONDITION_OPTIONS"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="购入渠道" prop="purchaseChannel">
        <el-select v-model="form.purchaseChannel" placeholder="请选择购入渠道" style="width: 100%" clearable>
          <el-option
            v-for="item in PURCHASE_CHANNEL_OPTIONS"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="日期" prop="date">
        <el-date-picker
          v-model="form.date"
          type="date"
          placeholder="选择日期"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="备注" prop="note">
        <el-input
          v-model="form.note"
          type="textarea"
          :rows="3"
          placeholder="可选备注"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>
