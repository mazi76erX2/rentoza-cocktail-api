from rest_framework import serializers
from .models import Patron, Drink


class PatronSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patron
        fields = ["id", "name", "body_mass", "alcohol_saturation_level"]


class DrinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Drink
        fields = ["id", "name", "abv", "amount"]
