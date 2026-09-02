import type { WidgetThemeOption } from '@widget-js/react'
import { useWidgetTheme, WidgetThemeForm, Window } from '@widget-js/react'

const goldThemeOption: WidgetThemeOption = {
  useGlobalTheme: true,
  borderRadius: true,
  backgroundColor: true,
  backgroundBorderColor: true,
  primaryColor: true,
  color: true,
} as const

export default function GoldConfigView() {
  const { widgetTheme, setWidgetTheme } = useWidgetTheme()

  return (
    <Window title="黄金设置">
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <WidgetThemeForm
          showSectionHeader={false}
          themeOption={goldThemeOption}
          value={widgetTheme}
          onChange={setWidgetTheme}
        />
      </div>
    </Window>
  )
}
