<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { BookWish, BookWishForm } from '@/types/book'

const props = defineProps<{
  visible: boolean
  wish?: BookWish | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  submit: [form: BookWishForm]
}>()

const defaultForm = (): BookWishForm => ({
  title: '',
  author: '',
  maxPrice: 0,
  note: '',
})

const form = reactive<BookWishForm>(defaultForm())

const formRef = ref<FormInstance>()

const rules: FormRules = {
  title: [{ required: true, message: '请输入书名', trigger: 'blur' }],
  author: [{ required: true, message: '请输入作者', trigger: 'blur' }],
  maxPrice: [{ required: true, message: '请输入期望最高价', trigger: 'blur' }],
}

const dialogTitle = () => (props.wish ? '编辑心愿' : '新增心愿')

function resetForm() {
  Object.assign(form, defaultForm())
}

watch(
  () => props.visible,
  (val) => {
    if (val && props.wish) {
      Object.assign(form, {
        title: props.wish.title,
        author: props.wish.author,
        maxPrice: props.wish.maxPrice,
        note: props.wish.note,
      })
    } else if (val) {
      resetForm()
    }
  }
)

function handleClose() {
  emit('update:visible', false)
}

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
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="书名" prop="title">
        <el-input v-model="form.title" placeholder="请输入书名" />
      </el-form-item>
      <el-form-item label="作者" prop="author">
        <el-input v-model="form.author" placeholder="请输入作者" />
      </el-form-item>
      <el-form-item label="期望最高价" prop="maxPrice">
        <el-input-number
          v-model="form.maxPrice"
          :min="0"
          :precision="2"
          :step="1"
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
