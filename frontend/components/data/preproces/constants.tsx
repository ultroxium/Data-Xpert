import { Binary, MinusSquare, Scaling, SquareArrowOutUpRight } from 'lucide-react';

export const DataTransformationToolsBasic = [
  {
    name: 'Feature Reduction',
    icon: <MinusSquare size={40} />,
    orderIndex: 4,
    methods: [
      {
        method: 'Remove Column',
        key: 'remove_columns',
        description: 'Excludes columns that are not useful or redundant for the model.',
        orderIndex: 1,
        canSkip: 'no', // Required to avoid overfitting and reduce dimensionality
      },
      // {
      //   method: 'Fill Missing Values',
      //   key: 'fill_missing',
      //   description: 'Imputes missing values in numerical and categorical features.',
      //   orderIndex: 2,
      //   canSkip: 'no', // Required for most algorithms
      // },
      {
        method: 'Remove duplicates',
        key: 'remove_duplicates',
        description: 'Removes duplicate rows in the dataset.',
        orderIndex: 3,
        canSkip: 'yes', // Optional, depends on the dataset
      },
    ],
  },

  {
    name: 'Encoding',
    icon: <Binary size={40} />,
    orderIndex: 1,
    methods: [
      {
        method: 'LabelEncoder',
        key: 'label',
        description: 'Encodes target labels with values between 0 and n_classes-1.',
        orderIndex: 2,
        canSkip: 'yes', // Optional
      },
      {
        method: 'OneHotEncoder',
        key: 'one_hot',
        description: 'Encodes categorical features as a one-hot numeric array.',
        orderIndex: 1,
        canSkip: 'no', // Required
      },

      {
        method: 'OrdinalEncoder',
        key: 'ordinal',
        description: 'Encodes categorical features as an integer array.',
        orderIndex: 3,
        canSkip: 'yes', // Optional
      },
      {
        method: 'BinaryEncoder',
        key: 'binary',
        description: 'Encodes categorical features as a binary array.',
        orderIndex: 4,
        canSkip: 'yes', // Optional
      },
    ],
  },
  {
    name: 'Outlier Handling',
    icon: <SquareArrowOutUpRight size={40} />,
    orderIndex: 3,
    methods: [
      {
        method: 'Z-Score',
        key: 'zscore',
        description:
          'Identifies outliers based on how many standard deviations a data point is from the mean.',
        orderIndex: 1,
        canSkip: 'no', // Required for detecting extreme outliers
      },
      {
        method: 'IQR (Interquartile Range)',
        key: 'iqr',
        description:
          'Defines outliers as points below or above certain thresholds based on the IQR.',
        orderIndex: 2,
        canSkip: 'no', // Required for detecting outliers in numerical data
      },
    ],
  },
  {
    name: 'Scaling',
    icon: <Scaling size={40} />,
    orderIndex: 2,
    methods: [
      {
        method: 'StandardScaler',
        key: 'standard',
        description: 'Standardizes features by removing the mean and scaling to unit variance.',
        orderIndex: 1,
        canSkip: 'no', // Required for some algorithms like SVM, KNN
      },
      {
        method: 'MinMaxScaler',
        key: 'minmax',
        description: 'Scales features to a given range, usually between 0 and 1.',
        orderIndex: 2,
        canSkip: 'yes', // Optional, depends on algorithm and requirements
      },
      {
        method: 'MaxAbsScaler',
        key: 'maxabs',
        description: 'Scales each feature by its maximum absolute value.',
        orderIndex: 3,
        canSkip: 'yes', // Optional
      },
      {
        method: 'RobustScaler',
        key: 'robust',
        description: 'Scales features using statistics that are robust to outliers.',
        orderIndex: 4,
        canSkip: 'yes', // Optional
      },
    ],
  },
];
