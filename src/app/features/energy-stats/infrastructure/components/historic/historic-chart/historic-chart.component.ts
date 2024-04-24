import {Component} from '@angular/core';
import {CalendarModule} from "primeng/calendar";
import {ChartLegendComponent} from "../chart-legend/chart-legend.component";
import {DataChartComponent} from "../data-chart/data-chart.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AsyncPipe, NgClass} from "@angular/common";
import {DatadisChartComponent} from "../datadis-chart/datadis-chart.component";
import {DateRange} from '../../../../domain/DateRange';
import {ChartStoreService} from '../../../services/chart-store.service';
import {ChartResource} from '../../../../domain/ChartResource';
import {MonitoringService} from "../../../services/monitoring.service";
import {ChartType} from '../../../../domain/ChartType';
import {ChartOrigins} from "../../../../domain/ChartOrigins";
import {
  QuestionBadgeComponent
} from "../../../../../../shared/infrastructure/components/question-badge/question-badge.component";

@Component({
  selector: 'app-historic-chart',
  standalone: true,
  imports: [
    CalendarModule,
    ChartLegendComponent,
    DataChartComponent,
    NgClass,
    ReactiveFormsModule,
    AsyncPipe,
    FormsModule,
    DatadisChartComponent,
    QuestionBadgeComponent
  ],
  templateUrl: './historic-chart.component.html',
  styleUrl: './historic-chart.component.scss'
})
export class HistoricChartComponent {
  date$ = this.chartStoreService.selectOnly(state => state.date);
  origin$ = this.chartStoreService.selectOnly(state => state.origin)
  maxDate = new Date();
  chartType$ = this.chartStoreService.selectOnly(state => state.chartType);
  calendarView$ = this.chartStoreService.selectOnly(state => {
    switch (state.dateRange) {
      case DateRange.MONTH:
        return 'month'
      case DateRange.YEAR:
        return 'year'
      case DateRange.DAY:
        return 'date'
    }
  });
  dateFormat$ = this.chartStoreService.selectOnly(state => {
    switch (state.dateRange) {
      case DateRange.MONTH:
        return 'mm-yy'
      case DateRange.YEAR:
        return 'yy'
      case DateRange.DAY:
        return 'dd-mm-yy'
    }
  });
  chartResource$ = this.chartStoreService.selectOnly(state => state.selectedChartResource);

  dateRange$ = this.chartStoreService.selectOnly(state => state.dateRange)
  protected readonly DateRange = DateRange;
  protected readonly ChartOrigins = ChartOrigins;
  protected readonly ChartResource = ChartResource;
  protected readonly ChartType = ChartType;

  constructor(
    private readonly monitoringService: MonitoringService,
    private readonly chartStoreService: ChartStoreService
  ) {
  }

  setChartType(event: Event) {
    const chartType = (event.target as any).value === 'ACC' ? ChartType.ACC : ChartType.CCE;
    this.chartStoreService.setChartType(chartType);
  }

  setDateRange(range: DateRange) {
    this.chartStoreService.setDateRange(range);
    this.chartStoreService.setDate(new Date());
  }

  setChartResource(event: Event) {
    const selectedValue = (event.target as any).value as string;
    let newResource: ChartResource;
    if (selectedValue === ChartResource.PRICE) {
      newResource = ChartResource.PRICE;
    } else {
      newResource = ChartResource.ENERGY;
    }

    this.chartStoreService.patchState({selectedChartResource: newResource});
  }

  setDate(date: Date) {
    this.chartStoreService.setDate(date);
  }

  setInputDate(date: Date){
    if (date && date.getTime()){
      this.chartStoreService.setDate(date);
    }
  }
}
