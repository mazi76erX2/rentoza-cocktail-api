from django.db import models


class Patron(models.Model):
    name = models.CharField(max_length=255)
    body_mass = models.IntegerField()
    alcohol_saturation_level = models.FloatField()


class Drink(models.Model):
    name = models.CharField(max_length=255)
    abv = models.FloatField()
    amount = models.IntegerField()
