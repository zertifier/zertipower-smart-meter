import {Component, computed, signal} from '@angular/core';
import {NavbarComponent} from "../../../../shared/components/navbar/navbar.component";
import {ChartModule} from "primeng/chart";
import {JsonPipe} from "@angular/common";
import {EnergyStat, MonitoringService, PowerStats} from "../../services/monitoring.service";
import {Subscription} from "rxjs";
import {ChartLegendComponent, DataLabel} from "../../components/chart-legend/chart-legend.component";
import {DataChartComponent} from "../../components/data-chart/data-chart.component";
import {StatDisplayComponent} from "../../components/stat-display/stat-display.component";
import {StatsColors} from "../../models/StatsColors";
import {
  ConsumptionItem,
  ConsumptionItemsComponent
} from "../../components/consumption-items/consumption-items.component";
import {FooterComponent} from "../../../../shared/components/footer/footer.component";
import {CalendarModule} from "primeng/calendar";
import {FormControl, ReactiveFormsModule, Validators} from "@angular/forms";
import {DateRange} from "../../models/DateRange";
import dayjs from "dayjs";


@Component({
  selector: 'app-my-cup-page',
  standalone: true,
  imports: [
    NavbarComponent,
    ChartModule,
    JsonPipe,
    ChartLegendComponent,
    DataChartComponent,
    StatDisplayComponent,
    ConsumptionItemsComponent,
    FooterComponent,
    CalendarModule,
    ReactiveFormsModule
  ],
  templateUrl: './my-cup-page.component.html',
  styleUrl: './my-cup-page.component.scss'
})
export class MyCupPageComponent {
  maxDate = new Date();
  dateRange = signal(DateRange.MONTH);
  calendarView = computed(() => {
    switch (this.dateRange()) {
      case DateRange.MONTH:
        return 'month'
      case DateRange.YEAR:
        return 'year'
      case DateRange.DAY:
        return 'date'
    }
  });
  dateFormat = computed(() => {
    switch (this.dateRange()) {
      case DateRange.MONTH:
        return 'yy-mm'
      case DateRange.YEAR:
        return 'yy'
      case DateRange.DAY:
        return 'dd-mm-yy'
    }
  })
  selectedDateFormControl = new FormControl(new Date(), [Validators.required])
  consumptionItems: ConsumptionItem[] = [
    {
      consumption: 0.015,
      label: 'LED',
      icon: 'fa-solid fa-lightbulb',
    },
    {
      consumption: 0.6,
      label: 'Nevera',
      icon: 'fa-solid fa-temperature-low',
    },
    {
      consumption: 0.25,
      label: 'TV',
      icon: 'fa-solid fa-tv',
    },
    {
      consumption: 0.5,
      label: 'Rentadora',
      icon: 'fa-solid fa-shirt',
    },
    {
      consumption: 2,
      label: 'Estufa',
      icon: 'fa-solid fa-fire-burner',
    },
    {
      consumption: 7,
      label: 'Cotxe elèctric',
      icon: 'fa-solid fa-car',
    },
  ];
  data: any
  readonly powerFlow = signal<PowerStats>({production: 0, buy: 0, inHouse: 0, sell: 0})
  fetchingData = false;
  chartLabels: DataLabel[] = [
    {
      color: StatsColors.BUY_CONSUMPTION,
      label: 'Consum',
      radius: '2.5rem',
    },
    {
      color: StatsColors.IN_HOUSE_CONSUMPTION,
      label: 'Autoconsum',
      radius: '2.5rem',
    },
    {
      color: StatsColors.PRODUCTION,
      label: 'Producció',
      radius: '2.5rem',
    },
    {
      color: StatsColors.SELL,
      label: 'Excedent',
      radius: '2.5rem',
    }
  ];
  subscriptions: Subscription[] = [];
  protected readonly StatsColors = StatsColors;
  protected readonly Component = Component;
  protected readonly DateRange = DateRange;

  constructor(private readonly monitoringService: MonitoringService) {
    this.monitoringService.start(60000);
  }

  setDateRange(range: DateRange) {
    this.dateRange.set(range);
    const currentDate = this.selectedDateFormControl.value || new Date();
    this.selectedDateFormControl.setValue(currentDate);
  }

  async ngOnInit(): Promise<void> {
    this.selectedDateFormControl.valueChanges.subscribe(async () => {
      if (this.selectedDateFormControl.invalid) {
        return;
      }
      const date = dayjs(this.selectedDateFormControl.value!).format('YYYY-MM-DD');
      const data = await this.fetchEnergyStats(date, this.dateRange())
      this.setDataChart(data, this.dateRange());
    });

    let subscription = this.monitoringService
      .getPowerFlow()
      .subscribe(value => {
        const {production, buy, inHouse, sell} = value;
        this.powerFlow.set({
          production: Math.round(production / 10) / 100,
          inHouse: Math.round(inHouse / 10) / 100,
          buy: Math.round(buy / 10) / 100,
          sell: Math.round(sell / 10) / 100,
        })
      })

    this.subscriptions.push(subscription);


    const data = await this.fetchEnergyStats(dayjs().format('YYYY-MM-DD'), this.dateRange())
    this.setDataChart(data, this.dateRange())

  }

  async fetchEnergyStats(date: string, range: DateRange) {
    this.fetchingData = true;
    let data: EnergyStat[];
    try {
      data = await this.monitoringService.getEnergyStats(date, range);
      return data;
    } finally {
      this.fetchingData = false;
    }
  }

  setDataChart(data: EnergyStat[], range: DateRange) {
    // TODO get labels
    let labels: string[] = ["Gener", "Febrer", "Març", "Abril", "Maig", "Juny", "Juliol", "Agost", "Setembre", "Octubre", "Novembre", "Desembre"];
    if (range === DateRange.MONTH) {
      labels = data.map(d => {
        return dayjs(d.date).format('DD-MM-YYYY');
      });
    } else if (range === DateRange.DAY) {
      labels = data.map(d => {
        return dayjs(d.date).format('HH:mm');
      })
    }

    this.data = {
      labels,
      datasets: [
        {
          label: 'Produccio',
          backgroundColor: StatsColors.PRODUCTION,
          borderRadius: 10,
          borderWidth: 1,
          data: data.map(d => d.sell + d.inHouseConsumption),
          stack: 'Stack 0'
        },
        {
          label: 'Consum de la xarxa electrica',
          backgroundColor: StatsColors.BUY_CONSUMPTION,
          borderRadius: 10,
          borderWidth: 1,
          data: data.map(d => d.buy),
          stack: 'Stack 1'
        },
        {
          label: 'Consum propi',
          backgroundColor: StatsColors.IN_HOUSE_CONSUMPTION,
          borderRadius: 10,
          borderWidth: 1,
          data: data.map(d => d.inHouseConsumption),
          stack: 'Stack 1'
        },
        {
          label: 'Excedent',
          backgroundColor: StatsColors.SELL,
          borderRadius: 10,
          borderWidth: 1,
          data: data.map(d => d.sell),
          stack: 'Stack 2'
        }
      ]
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => {
      s.unsubscribe();
    })
  }
}
