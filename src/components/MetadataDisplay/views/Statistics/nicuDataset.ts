import { Dataset } from './types';

export const nicuDataset: Dataset = {
  "@context": {
    "@vocab": "https://schema.org/",
    "stato": "http://purl.obolibrary.org/obo/STATO_",
    "evi": "https://your-domain.org/extensions#"
  },
  "@type": "Dataset",
  "@id": "dataset/nicu-vitals",
  "name": "NICU Vital Signs Dataset",
  "description": "Vital signs data from UVA NICU including heart rate and oxygen saturation measurements",
  "summaryStatistics": [
    {
      "@type": "evi:ColumnStatistics",
      "@id": "columnStat/hr-overall",
      "name": "Heart Rate (bpm)",
      "statistics": [
        { "@type": "evi:Statistic", "name": "Mean", "value": 142.3 },
        { "@type": "evi:Statistic", "name": "Median", "value": 141.8 },
        { "@type": "evi:Statistic", "name": "Std Dev", "value": 18.5 },
        { "@type": "evi:Statistic", "name": "Q1", "value": 130.2 },
        { "@type": "evi:Statistic", "name": "Q3", "value": 154.7 },
        { "@type": "evi:Statistic", "name": "Min", "value": 98.4 },
        { "@type": "evi:Statistic", "name": "Max", "value": 198.2 }
      ]
    },
    {
      "@type": "evi:ColumnStatistics",
      "@id": "columnStat/spo2-overall",
      "name": "SpO2 (%)",
      "statistics": [
        { "@type": "evi:Statistic", "name": "Mean", "value": 95.8 },
        { "@type": "evi:Statistic", "name": "Median", "value": 96.2 },
        { "@type": "evi:Statistic", "name": "Std Dev", "value": 3.2 },
        { "@type": "evi:Statistic", "name": "Q1", "value": 94.1 },
        { "@type": "evi:Statistic", "name": "Q3", "value": 97.8 },
        { "@type": "evi:Statistic", "name": "Min", "value": 85.2 },
        { "@type": "evi:Statistic", "name": "Max", "value": 100.0 }
      ]
    }
  ],
  "subsets": [
    {
      "@type": "evi:Subset",
      "@id": "subset/sex-male",
      "name": "Male",
      "group": "Sex",
      "description": "Statistics for male NICU patients",
      "query": "sex = 'M'",
      "summaryStatistics": [
        {
          "@type": "evi:ColumnStatistics",
          "@id": "columnStat/hr-male",
          "name": "Heart Rate (bpm)",
          "statistics": [
            { "@type": "evi:Statistic", "name": "Mean", "value": 143.8 },
            { "@type": "evi:Statistic", "name": "Median", "value": 143.1 },
            { "@type": "evi:Statistic", "name": "Std Dev", "value": 19.2 },
            { "@type": "evi:Statistic", "name": "Q1", "value": 131.4 },
            { "@type": "evi:Statistic", "name": "Q3", "value": 156.2 },
            { "@type": "evi:Statistic", "name": "Min", "value": 100.2 },
            { "@type": "evi:Statistic", "name": "Max", "value": 198.2 }
          ]
        },
        {
          "@type": "evi:ColumnStatistics",
          "@id": "columnStat/spo2-male",
          "name": "SpO2 (%)",
          "statistics": [
            { "@type": "evi:Statistic", "name": "Mean", "value": 95.6 },
            { "@type": "evi:Statistic", "name": "Median", "value": 96.0 },
            { "@type": "evi:Statistic", "name": "Std Dev", "value": 3.4 },
            { "@type": "evi:Statistic", "name": "Q1", "value": 93.8 },
            { "@type": "evi:Statistic", "name": "Q3", "value": 97.6 },
            { "@type": "evi:Statistic", "name": "Min", "value": 85.2 },
            { "@type": "evi:Statistic", "name": "Max", "value": 100.0 }
          ]
        }
      ]
    },
    {
      "@type": "evi:Subset",
      "@id": "subset/sex-female",
      "name": "Female",
      "group": "Sex",
      "description": "Statistics for female NICU patients",
      "query": "sex = 'F'",
      "summaryStatistics": [
        {
          "@type": "evi:ColumnStatistics",
          "@id": "columnStat/hr-female",
          "name": "Heart Rate (bpm)",
          "statistics": [
            { "@type": "evi:Statistic", "name": "Mean", "value": 140.7 },
            { "@type": "evi:Statistic", "name": "Median", "value": 140.4 },
            { "@type": "evi:Statistic", "name": "Std Dev", "value": 17.6 },
            { "@type": "evi:Statistic", "name": "Q1", "value": 129.1 },
            { "@type": "evi:Statistic", "name": "Q3", "value": 153.2 },
            { "@type": "evi:Statistic", "name": "Min", "value": 98.4 },
            { "@type": "evi:Statistic", "name": "Max", "value": 192.5 }
          ]
        },
        {
          "@type": "evi:ColumnStatistics",
          "@id": "columnStat/spo2-female",
          "name": "SpO2 (%)",
          "statistics": [
            { "@type": "evi:Statistic", "name": "Mean", "value": 96.1 },
            { "@type": "evi:Statistic", "name": "Median", "value": 96.4 },
            { "@type": "evi:Statistic", "name": "Std Dev", "value": 2.9 },
            { "@type": "evi:Statistic", "name": "Q1", "value": 94.5 },
            { "@type": "evi:Statistic", "name": "Q3", "value": 98.1 },
            { "@type": "evi:Statistic", "name": "Min", "value": 87.3 },
            { "@type": "evi:Statistic", "name": "Max", "value": 100.0 }
          ]
        }
      ]
    },
    {
      "@type": "evi:Subset",
      "@id": "subset/race-white",
      "name": "White",
      "group": "Race",
      "description": "Statistics for White patients",
      "query": "race = 'White'",
      "summaryStatistics": [
        {
          "@type": "evi:ColumnStatistics",
          "@id": "columnStat/hr-white",
          "name": "Heart Rate (bpm)",
          "statistics": [
            { "@type": "evi:Statistic", "name": "Mean", "value": 141.5 },
            { "@type": "evi:Statistic", "name": "Median", "value": 141.0 },
            { "@type": "evi:Statistic", "name": "Std Dev", "value": 18.1 },
            { "@type": "evi:Statistic", "name": "Q1", "value": 129.8 },
            { "@type": "evi:Statistic", "name": "Q3", "value": 154.0 },
            { "@type": "evi:Statistic", "name": "Min", "value": 99.2 },
            { "@type": "evi:Statistic", "name": "Max", "value": 195.3 }
          ]
        },
        {
          "@type": "evi:ColumnStatistics",
          "@id": "columnStat/spo2-white",
          "name": "SpO2 (%)",
          "statistics": [
            { "@type": "evi:Statistic", "name": "Mean", "value": 96.0 },
            { "@type": "evi:Statistic", "name": "Median", "value": 96.3 },
            { "@type": "evi:Statistic", "name": "Std Dev", "value": 3.1 },
            { "@type": "evi:Statistic", "name": "Q1", "value": 94.3 },
            { "@type": "evi:Statistic", "name": "Q3", "value": 97.9 },
            { "@type": "evi:Statistic", "name": "Min", "value": 86.5 },
            { "@type": "evi:Statistic", "name": "Max", "value": 100.0 }
          ]
        }
      ]
    },
    {
      "@type": "evi:Subset",
      "@id": "subset/race-black",
      "name": "Black/African American",
      "group": "Race",
      "description": "Statistics for Black/African American patients",
      "query": "race = 'Black'",
      "summaryStatistics": [
        {
          "@type": "evi:ColumnStatistics",
          "@id": "columnStat/hr-black",
          "name": "Heart Rate (bpm)",
          "statistics": [
            { "@type": "evi:Statistic", "name": "Mean", "value": 144.2 },
            { "@type": "evi:Statistic", "name": "Median", "value": 143.8 },
            { "@type": "evi:Statistic", "name": "Std Dev", "value": 19.3 },
            { "@type": "evi:Statistic", "name": "Q1", "value": 131.6 },
            { "@type": "evi:Statistic", "name": "Q3", "value": 156.8 },
            { "@type": "evi:Statistic", "name": "Min", "value": 98.4 },
            { "@type": "evi:Statistic", "name": "Max", "value": 198.2 }
          ]
        },
        {
          "@type": "evi:ColumnStatistics",
          "@id": "columnStat/spo2-black",
          "name": "SpO2 (%)",
          "statistics": [
            { "@type": "evi:Statistic", "name": "Mean", "value": 95.4 },
            { "@type": "evi:Statistic", "name": "Median", "value": 95.9 },
            { "@type": "evi:Statistic", "name": "Std Dev", "value": 3.5 },
            { "@type": "evi:Statistic", "name": "Q1", "value": 93.6 },
            { "@type": "evi:Statistic", "name": "Q3", "value": 97.5 },
            { "@type": "evi:Statistic", "name": "Min", "value": 85.2 },
            { "@type": "evi:Statistic", "name": "Max", "value": 100.0 }
          ]
        }
      ]
    },
    {
      "@type": "evi:Subset",
      "@id": "subset/race-hispanic",
      "name": "Hispanic/Latino",
      "group": "Race",
      "description": "Statistics for Hispanic/Latino patients",
      "query": "race = 'Hispanic'",
      "summaryStatistics": [
        {
          "@type": "evi:ColumnStatistics",
          "@id": "columnStat/hr-hispanic",
          "name": "Heart Rate (bpm)",
          "statistics": [
            { "@type": "evi:Statistic", "name": "Mean", "value": 142.8 },
            { "@type": "evi:Statistic", "name": "Median", "value": 142.2 },
            { "@type": "evi:Statistic", "name": "Std Dev", "value": 18.7 },
            { "@type": "evi:Statistic", "name": "Q1", "value": 130.5 },
            { "@type": "evi:Statistic", "name": "Q3", "value": 155.3 },
            { "@type": "evi:Statistic", "name": "Min", "value": 101.8 },
            { "@type": "evi:Statistic", "name": "Max", "value": 194.7 }
          ]
        },
        {
          "@type": "evi:ColumnStatistics",
          "@id": "columnStat/spo2-hispanic",
          "name": "SpO2 (%)",
          "statistics": [
            { "@type": "evi:Statistic", "name": "Mean", "value": 95.9 },
            { "@type": "evi:Statistic", "name": "Median", "value": 96.3 },
            { "@type": "evi:Statistic", "name": "Std Dev", "value": 3.0 },
            { "@type": "evi:Statistic", "name": "Q1", "value": 94.2 },
            { "@type": "evi:Statistic", "name": "Q3", "value": 97.8 },
            { "@type": "evi:Statistic", "name": "Min", "value": 86.9 },
            { "@type": "evi:Statistic", "name": "Max", "value": 100.0 }
          ]
        }
      ]
    },
    {
      "@type": "evi:Subset",
      "@id": "subset/birthweight-vlbw",
      "name": "VLBW (<1500g)",
      "group": "Birth Weight",
      "description": "Very Low Birth Weight infants",
      "query": "birthWeight < 1500",
      "summaryStatistics": [
        {
          "@type": "evi:ColumnStatistics",
          "@id": "columnStat/hr-vlbw",
          "name": "Heart Rate (bpm)",
          "statistics": [
            { "@type": "evi:Statistic", "name": "Mean", "value": 149.2 },
            { "@type": "evi:Statistic", "name": "Median", "value": 148.6 },
            { "@type": "evi:Statistic", "name": "Std Dev", "value": 21.3 },
            { "@type": "evi:Statistic", "name": "Q1", "value": 136.8 },
            { "@type": "evi:Statistic", "name": "Q3", "value": 162.4 },
            { "@type": "evi:Statistic", "name": "Min", "value": 105.3 },
            { "@type": "evi:Statistic", "name": "Max", "value": 198.2 }
          ]
        },
        {
          "@type": "evi:ColumnStatistics",
          "@id": "columnStat/spo2-vlbw",
          "name": "SpO2 (%)",
          "statistics": [
            { "@type": "evi:Statistic", "name": "Mean", "value": 94.2 },
            { "@type": "evi:Statistic", "name": "Median", "value": 94.8 },
            { "@type": "evi:Statistic", "name": "Std Dev", "value": 4.1 },
            { "@type": "evi:Statistic", "name": "Q1", "value": 92.1 },
            { "@type": "evi:Statistic", "name": "Q3", "value": 96.9 },
            { "@type": "evi:Statistic", "name": "Min", "value": 85.2 },
            { "@type": "evi:Statistic", "name": "Max", "value": 100.0 }
          ]
        }
      ]
    },
    {
      "@type": "evi:Subset",
      "@id": "subset/birthweight-lbw",
      "name": "LBW (1500-2500g)",
      "group": "Birth Weight",
      "description": "Low Birth Weight infants",
      "query": "birthWeight >= 1500 AND birthWeight < 2500",
      "summaryStatistics": [
        {
          "@type": "evi:ColumnStatistics",
          "@id": "columnStat/hr-lbw",
          "name": "Heart Rate (bpm)",
          "statistics": [
            { "@type": "evi:Statistic", "name": "Mean", "value": 141.8 },
            { "@type": "evi:Statistic", "name": "Median", "value": 141.3 },
            { "@type": "evi:Statistic", "name": "Std Dev", "value": 17.8 },
            { "@type": "evi:Statistic", "name": "Q1", "value": 130.5 },
            { "@type": "evi:Statistic", "name": "Q3", "value": 153.9 },
            { "@type": "evi:Statistic", "name": "Min", "value": 100.8 },
            { "@type": "evi:Statistic", "name": "Max", "value": 192.5 }
          ]
        },
        {
          "@type": "evi:ColumnStatistics",
          "@id": "columnStat/spo2-lbw",
          "name": "SpO2 (%)",
          "statistics": [
            { "@type": "evi:Statistic", "name": "Mean", "value": 95.8 },
            { "@type": "evi:Statistic", "name": "Median", "value": 96.2 },
            { "@type": "evi:Statistic", "name": "Std Dev", "value": 3.3 },
            { "@type": "evi:Statistic", "name": "Q1", "value": 94.0 },
            { "@type": "evi:Statistic", "name": "Q3", "value": 97.7 },
            { "@type": "evi:Statistic", "name": "Min", "value": 86.4 },
            { "@type": "evi:Statistic", "name": "Max", "value": 100.0 }
          ]
        }
      ]
    },
    {
      "@type": "evi:Subset",
      "@id": "subset/birthweight-normal",
      "name": "Normal (≥2500g)",
      "group": "Birth Weight",
      "description": "Normal birth weight infants",
      "query": "birthWeight >= 2500",
      "summaryStatistics": [
        {
          "@type": "evi:ColumnStatistics",
          "@id": "columnStat/hr-normal",
          "name": "Heart Rate (bpm)",
          "statistics": [
            { "@type": "evi:Statistic", "name": "Mean", "value": 138.4 },
            { "@type": "evi:Statistic", "name": "Median", "value": 138.1 },
            { "@type": "evi:Statistic", "name": "Std Dev", "value": 16.2 },
            { "@type": "evi:Statistic", "name": "Q1", "value": 127.8 },
            { "@type": "evi:Statistic", "name": "Q3", "value": 150.3 },
            { "@type": "evi:Statistic", "name": "Min", "value": 98.4 },
            { "@type": "evi:Statistic", "name": "Max", "value": 185.7 }
          ]
        },
        {
          "@type": "evi:ColumnStatistics",
          "@id": "columnStat/spo2-normal",
          "name": "SpO2 (%)",
          "statistics": [
            { "@type": "evi:Statistic", "name": "Mean", "value": 96.8 },
            { "@type": "evi:Statistic", "name": "Median", "value": 97.1 },
            { "@type": "evi:Statistic", "name": "Std Dev", "value": 2.4 },
            { "@type": "evi:Statistic", "name": "Q1", "value": 95.3 },
            { "@type": "evi:Statistic", "name": "Q3", "value": 98.6 },
            { "@type": "evi:Statistic", "name": "Min", "value": 89.7 },
            { "@type": "evi:Statistic", "name": "Max", "value": 100.0 }
          ]
        }
      ]
    }
  ]
};
