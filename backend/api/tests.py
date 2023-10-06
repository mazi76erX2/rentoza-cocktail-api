import math
from typing import Dict, Any
from datetime import timedelta
from django.utils import timezone
from django.test import RequestFactory
from rest_framework import status
from .views import (
    calculate_alcohol_saturation_level,
    add_drink_to_patron_tally,
    get_patron_alcohol_saturation_level,
    add_patron,
    add_default_values_to_patron,
    delete_patron,
    get_alcohol_saturation_levels,
)

factory = RequestFactory()


def test_calculate_alcohol_saturation_level() -> None:
    alcohol_consumed = 2.0
    body_mass = 70
    time_since_drink = 1.5

    alcohol_saturation_level = calculate_alcohol_saturation_level(
        alcohol_consumed, body_mass, time_since_drink
    )

    expected_saturation_level = (
        alcohol_consumed / body_mass * math.exp(-time_since_drink / 0.15)
    )

    assert math.isclose(alcohol_saturation_level, expected_saturation_level)


from django.http import QueryDict


def test_add_drink_to_patron_tally() -> None:
    patron_id = 1
    drink_id = 1
    request = factory.post(f"/api/patrons/{patron_id}/add_drink/")
    request_data = {"drink_id": str(drink_id)}
    request.POST.update(request_data)

    response = add_drink_to_patron_tally(request, patron_id)

    assert response.status_code == status.HTTP_200_OK


def test_get_patron_alcohol_saturation_level() -> None:
    patron_id = 1
    request = factory.get(f"/api/patrons/{patron_id}/alcohol_saturation_level/")

    response = get_patron_alcohol_saturation_level(request, patron_id)

    assert response.status_code == status.HTTP_200_OK


def test_add_patron() -> None:
    patron_data: Dict[str, Any] = {
        "name": "John Doe",
        "body_mass": 70,
        "alcohol_saturation_level": 0.0,
    }
    request = factory.post("/api/patrons/add_patron/", data=patron_data)

    response = add_patron(request)

    assert response.status_code == status.HTTP_201_CREATED


def test_add_default_values_to_patron() -> None:
    request = factory.post("/api/patrons/add_default_values/")

    response = add_default_values_to_patron(request)

    assert response.status_code == status.HTTP_200_OK


def test_delete_patron() -> None:
    patron_id = 1
    request = factory.delete(f"/api/patrons/{patron_id}/")

    response = delete_patron(request, pk=patron_id)

    assert response.status_code == status.HTTP_204_NO_CONTENT


def test_get_alcohol_saturation_levels() -> None:
    name = "Margarita"
    request = factory.get(f"/api/alcohol_saturation_levels/{name}/")

    response = get_alcohol_saturation_levels(request, name)

    assert response.status_code == status.HTTP_200_OK


def run_all_tests() -> None:
    test_calculate_alcohol_saturation_level()
    test_add_drink_to_patron_tally()
    test_get_patron_alcohol_saturation_level()
    test_add_patron()
    test_add_default_values_to_patron()
    test_delete_patron()
    test_get_alcohol_saturation_levels()


if __name__ == "__main__":
    run_all_tests()
