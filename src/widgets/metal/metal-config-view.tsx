import type { WidgetThemeOption } from '@widget-js/react'
import { useWidgetTheme, WidgetThemeForm, Window } from '@widget-js/react'

const metalThemeOption: WidgetThemeOption = {
  useGlobalTheme: true,
  borderRadius: true,
  backgroundColor: true,
  backgroundBorderColor: true,
  primaryColor: true,
  color: true,
} as const

export default function MetalConfigView() {
  const { widgetTheme, setWidgetTheme } = useWidgetTheme()

  return (
    <Window title="国际贵金属设置">
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <WidgetThemeForm
          showSectionHeader={false}
          themeOption={metalThemeOption}
          value={widgetTheme}
          onChange={setWidgetTheme}
        />
      </div>
    </Window>
  )
}
