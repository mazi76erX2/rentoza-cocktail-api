import math
import requests
from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.request import Request
from rest_framework.response import Response

from .models import Patron, Drink
from .serializers import PatronSerializer, DrinkSerializer

ALCOHOL_SATURATION_DECAY_RATE = 0.15


class PatronViewSet(viewsets.ModelViewSet):
    queryset = Patron.objects.all()
    serializer_class = PatronSerializer


class DrinkViewSet(viewsets.ModelViewSet):
    queryset = Drink.objects.all()
    serializer_class = DrinkSerializer


def calculate_alcohol_saturation_level(
    alcohol_consumed: float, body_mass: int, time_since_drink: float
) -> float:
    """Calculates the alcohol saturation level of a patron.

    Args:
        alcohol_consumed: The amount of alcohol consumed by the patron.
        body_mass: The patron's body mass.
        time_since_drink: The time since the patron consumed the individual drink.

    Returns:
        The alcohol saturation level of the patron.
    """

    alcohol_consumption_per_unit_body_mass = alcohol_consumed / body_mass
    decay_factor = math.exp(-time_since_drink / ALCOHOL_SATURATION_DECAY_RATE)
    alcohol_saturation_level = alcohol_consumption_per_unit_body_mass * decay_factor
    return alcohol_saturation_level


@api_view(["POST"])
def add_drink_to_patron_tally(request: Request, patron_id: int) -> Response:
    patron = Patron.objects.get(id=patron_id)
    drink = Drink.objects.get(id=request.data["drink_id"])

    alcohol_consumed = drink.amount * drink.abv

    patron.alcohol_saturation_level = calculate_alcohol_saturation_level(
        alcohol_consumed, patron.body_mass, 0
    )
    patron.save()

    return Response(status=status.HTTP_200_OK)


@api_view(["GET"])
def get_patron_alcohol_saturation_level(request: Request, patron_id: int) -> Response:
    patron = Patron.objects.get(id=patron_id)

    return Response({"alcohol_saturation_level": patron.alcohol_saturation_level})


@api_view(["POST"])
def add_patron(request: Request) -> Response:
    patron_data = request.data

    patron_serializer = PatronSerializer(data=patron_data)
    patron_serializer.is_valid(raise_exception=True)
    patron = patron_serializer.save()

    return Response(PatronSerializer(patron).data, status=status.HTTP_201_CREATED)


@api_view(["POST"])
def add_default_values_to_patron(request: Request) -> Response:
    default_values = {
        "name": "Default Patron",
        "body_mass": 70,
        "alcohol_saturation_level": 0.0,
    }

    return Response(default_values)


@api_view(["DELETE"])
def delete_patron(request: Request, pk=None) -> Response:
    try:
        patron = Patron.objects.get(pk=pk)
        patron.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Patron.DoesNotExist:
        return Response({"error": "Patron not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(["GET"])
def get_alcohol_saturation_levels(request: Request, name: str) -> Response:
    url = f"http://www.thecocktaildb.com/api/json/v1/1/search.php?s={name}"

    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        alcohol_saturation_levels = []

        if "drinks" in data:
            drinks = data["drinks"]
            for drink in drinks:
                alcohol_consumed = float(drink["strMeasure1"]) * float(drink["strABV"])
                alcohol_saturation_level = calculate_alcohol_saturation_level(
                    alcohol_consumed, 70, 0
                )
                alcohol_saturation_levels.append(alcohol_saturation_level)

        return Response(alcohol_saturation_levels, status=status.HTTP_200_OK)

    return Response(
        {"error": "Failed to fetch alcohol saturation levels"},
        status=response.status_code,
    )
