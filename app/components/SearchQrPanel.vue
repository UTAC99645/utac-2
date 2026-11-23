<template>
  <!-- ========================================================== -->
  <!-- QR 码面板（首页 QR 模式下显示）
       纠错等级 / 前缀开关 / 后缀开关 / 下载 均由 useQrCode 驱动
  -->
  <!-- ========================================================== -->
  <n-flex justify="center" style="margin-top: 20px">
    <!-- 纠错等级选择（L/M/Q/H，纠错能力由低到高） -->
    <div>
      <n-button v-for="item in QR_LEVELS" :key="item.value" type="error" size="small" @click="
        () => {
          qr.level.value = item.value;
          message.warning(`Set QR code error correction level to ${item.value}`);
        }
      ">
        {{ item.label }}
      </n-button>
    </div>

    <!-- 功能开关行：
         N/U  —— 额外前缀开关（在二维码内容前拼接所选引擎的 url）
         O/NO —— Link 后缀开关（追加 &type=Link&open=true；
                仅前缀为 Link 时显示） -->
    <n-divider style="height: 3vh">
      <n-divider vertical />
      <n-switch id="1" v-model:value="qr.prefixOn.value" size="large">
        <template #checked>N</template>
        <template #unchecked>U</template>
      </n-switch>
      <n-divider vertical />
      <n-button @click="qr.download" type="success" size="small">Download</n-button>
      <n-divider v-show="qr.prefixOn.value && qr.prefixEngine.value === 'Link'" vertical />
      <n-switch v-show="qr.prefixOn.value && qr.prefixEngine.value === 'Link'" id="2" v-model:value="qr.suffixOn.value" size="large">
        <template #checked>O</template>
        <template #unchecked>NO</template>
      </n-switch>
      <n-divider v-show="qr.prefixOn.value && qr.prefixEngine.value === 'Link'" vertical />
    </n-divider>

    <!-- 额外前缀的引擎选择（高亮项为当前所选） -->
    <n-flex v-show="qr.prefixOn.value">
      <n-button v-for="key in engineNames" :key="key" :type="key === qr.prefixEngine.value ? 'primary' : 'default'" @click="qr.prefixEngine.value = key">
        {{ key }}
      </n-button>
    </n-flex>

    <!-- QR 码本体（value 为最终拼接结果） -->
    <n-qr-code id="qrcode" :padding="0" :value="qr.value.value" :error-correction-level="qr.level.value" :size="325" />
    <n-divider />
  </n-flex>
</template>

<script setup lang="ts">
// ============================================================
// QR 码面板脚本
// ============================================================

import { QR_LEVELS, useQrCode } from '~/composables/useQrCode'

const props = defineProps<{ content: string }>()

const message = useMessage()
const { engineNames } = useEngines()

const qr = useQrCode(toRef(props, 'content'))
</script>
