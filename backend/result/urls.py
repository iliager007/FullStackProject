from django.urls import path
from . import views
urlpatterns = [
   path('save/', views.save_result, name='save_result'),
   path('results/', views.get_results, name='get_results'),
]