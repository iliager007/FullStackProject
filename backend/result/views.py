from django.shortcuts import render

# Create your views here.
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
import json
from .models import GameResult
@csrf_exempt
@login_required
def save_result(request):
   if request.method == 'POST':
       try:
           data = json.loads(request.body)
           result = GameResult.objects.create(
               user=request.user,
               difficulty=data['difficulty'],
               time_taken=data['timeTaken'],
               won=data['won']
           )
           return JsonResponse({'message': 'Result saved successfully'})
       except Exception as e:
           return JsonResponse({'error': str(e)}, status=400)
@login_required
def get_results(request):
   results = GameResult.objects.filter(user=request.user)[:10]  # Get last 10 results
   return JsonResponse({
       'results': [{
           'difficulty': r.difficulty,
           'timeTaken': r.time_taken,
           'won': r.won,
           'date': r.created_at.strftime('%Y-%m-%d %H:%M:%S')
       } for r in results]
   })
