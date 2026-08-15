from types import SimpleNamespace

from app.routers.reports import _filter_duplicate_groups, _group_prediction_analysis


def _prediction(image_name: str):
    return SimpleNamespace(
        material='Cotton',
        waste_category='Recyclable',
        recyclability_level='Good',
        recommendation='Reuse where possible',
        image_name=image_name,
    )


def test_exclude_specific_image_ids_from_duplicate_groups():
    predictions = [
        _prediction('keep-1.jpg'),
        _prediction('skip-me.jpg'),
        _prediction('keep-2.jpg'),
    ]

    groups = _group_prediction_analysis(predictions)
    filtered = _filter_duplicate_groups(groups, excluded_image_ids={'skip-me.jpg'})

    assert len(filtered) == 1
    assert filtered[0]['count'] == 2
    assert filtered[0]['image_names'] == ['keep-1.jpg', 'keep-2.jpg']
