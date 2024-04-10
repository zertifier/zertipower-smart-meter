import {Component} from '@angular/core';
import {DateRange} from "../../../models/DateRange";
import {CalendarModule} from "primeng/calendar";
import {ChartLegendComponent} from "../chart-legend/chart-legend.component";
import {DataChartComponent} from "../data-chart/data-chart.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AsyncPipe, NgClass} from "@angular/common";
import {MonitoringService} from "../../../services/monitoring.service";
import {ChartOrigins, ChartStoreService} from "../../../services/chart-store.service";
import {DatadisChartComponent} from "../cups-datadis-chart/datadis-chart.component";
import {ChartResource} from "../../../domain/ChartResource";

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
    DatadisChartComponent
  ],
  templateUrl: './historic-chart.component.html',
  styleUrl: './historic-chart.component.scss'
})
export class HistoricChartComponent {
  date$ = this.chartStoreService.selectOnly(state => state.date);
  origin$ = this.chartStoreService.selectOnly(state => state.origin)
  maxDate = new Date();
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

  constructor(
    private readonly monitoringService: MonitoringService,
    private readonly chartStoreService: ChartStoreService
  ) {
  }

  setDateRange(range: DateRange) {
    this.chartStoreService.setDateRange(range);
    this.chartStoreService.setDate(new Date());
  }

  setChartResource(event: Event) {
    const selectedValue = (event.target as any).value as string;
    let newResource: ChartResource;
    if (selectedValue === 'price') {
      newResource = ChartResource.PRICE;
    } else {
      newResource = ChartResource.ENERGY;
    }

    this.chartStoreService.patchState({selectedChartResource: newResource});
  }

  setDate(date: Date) {
    this.chartStoreService.setDate(date);
  }
}
