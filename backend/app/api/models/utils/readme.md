svr_model = SupportVectorRegressionModel(
    db=db,
    b2_filemanager=b2_filemanager,
    dataset_id=dataset_id,
    ignore_columns=ignore_columns,
    target_column=target_column
)

# Train the model with custom parameters
model = svr_model.train(
    kernel='rbf',
    C=1.0,
    epsilon=0.1
)

# Evaluate the model
results, model_id = svr_model.evaluate()


gb_model = GradientBoostingRegressionModel(
    db=db,
    b2_filemanager=b2_filemanager,
    dataset_id=dataset_id,
    ignore_columns=ignore_columns,
    target_column=target_column
)

# Train the model with custom parameters
model = gb_model.train(
    n_estimators=100,
    learning_rate=0.1,
    max_depth=3,
    min_samples_split=2,
    min_samples_leaf=1,
    subsample=1.0
)

# Evaluate the model
results, model_id = gb_model.evaluate()

# Get learning curves
learning_curves = gb_model.get_learning_curves()


knn_model = KNNRegressionModel(
    db=db,
    b2_filemanager=b2_filemanager,
    dataset_id=dataset_id,
    ignore_columns=ignore_columns,
    target_column=target_column
)

# Train the model with custom parameters
model = knn_model.train(
    n_neighbors=5,
    weights='uniform',
    algorithm='auto',
    leaf_size=30,
    p=2
)

# Evaluate the model
results, model_id = knn_model.evaluate()

# Analyze neighbors for a specific sample
sample = X_test.iloc[0]
neighbor_analysis = knn_model.analyze_neighbors(sample)


