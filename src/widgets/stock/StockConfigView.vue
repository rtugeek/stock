<script lang="ts" setup>
import StockColorFormItem from '@/component/StockColorFormItem.vue'
import StockSelect from '@/component/StockSelect.vue'
import { useSelfSelectStock } from '@/hook/useSelfSelectStock'
import { HamburgerButton } from '@icon-park/vue-next'
import { useSortable } from '@vueuse/integrations/useSortable'
import { delay } from '@widget-js/core'
import {
  useWidget,
  WidgetConfigOption,
  WidgetEditDialog,
} from '@widget-js/vue3'
import { ref } from 'vue'

const stockList = ref<HTMLElement | null>(null)
const { widgetParams, save } = useWidget()
const { stocks, save: saveStock, deleteStock, saveAll } = useSelfSelectStock()
const widgetConfigOption = new WidgetConfigOption({
  title: '股票设置',
  theme: {
    backgroundColor: true,
    borderRadius: true,
    fontSize: [12, 30],
  },
})

useSortable(stockList, stocks, {
  animation: 200,
  handle: '.handler',
  onEnd: async () => {
    // 有个动画的延迟
    await delay(300)
    saveAll(stocks.value)
  },
})
</script>

<template>
  <WidgetEditDialog
    :widget-params="widgetParams"
    :option="widgetConfigOption"
    @apply="save()"
    @confirm="save({ closeWindow: true })"
  >
    <template #custom>
      <el-form label-width="70">
        <StockColorFormItem />
        <el-form-item label="添加股票">
          <StockSelect @select="saveStock" />
        </el-form-item>
        <h3>自选列表</h3>
        <el-scrollbar height="450">
          <div ref="stockList" class="flex flex-col gap-2">
            <div v-for="stock in stocks" :key="stock.code">
              <el-card shadow="never" body-style="padding:0.5rem">
                <div class="flex items-center">
                  <div class="handler">
                    <HamburgerButton />
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="name">
                      {{ stock.name }}
                    </div>
                    <div class="code">
                      {{ stock.code }}
                    </div>
                  </div>
                  <el-button class="ml-auto" type="danger" size="small" @click="deleteStock(stock)">
                    删除
                  </el-button>
                </div>
              </el-card>
            </div>
          </div>
        </el-scrollbar>
      </el-form>
    </template>
  </WidgetEditDialog>
</template>

<style lang="scss">
.handler {
  display: flex;
  justify-items: center;
  width: 2rem;
  height: 1.5rem;
  cursor: grab;
  align-items: center;
  font-size: 1rem;
  justify-content: center;
}

.i-icon{
 line-height: 1;
}

.name{
  font-weight: bold;
}
</style>
