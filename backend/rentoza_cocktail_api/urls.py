"""
URL configuration for rentoza_cocktail_api project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/dev/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path, include
from api.views import (
    add_drink_to_patron_tally,
    get_patron_alcohol_saturation_level,
    add_default_values_to_patron,
    add_patron,
    delete_patron,
)

urlpatterns = [
    path("api-auth/", include("rest_framework.urls")),
    path(
        "api/patrons/<int:patron_id>/add-drink/<int:drink_id>/",
        add_drink_to_patron_tally,
        name="add_drink_to_patron_tally",
    ),
    path(
        "api/patrons/<int:patron_id>/saturation-level/",
        get_patron_alcohol_saturation_level,
        name="get_patron_alcohol_saturation_level",
    ),
    path(
        "api/patrons/add-default-values/",
        add_default_values_to_patron,
        name="add_default_values_to_patron",
    ),
    path("api/patrons/", add_patron, name="add_patron"),
    path("api/patrons/<int:patron_id>/", delete_patron, name="delete_patron"),
]
