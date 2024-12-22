from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.views.decorators.csrf import ensure_csrf_cookie

@api_view(['POST'])
def register_user(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response({'error': 'Please provide username and password'}, 
                      status=status.HTTP_400_BAD_REQUEST)
    
    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, 
                      status=status.HTTP_400_BAD_REQUEST)
    
    user = User.objects.create_user(username=username, password=password)
    return Response({'message': 'User created successfully'}, 
                   status=status.HTTP_201_CREATED)

@api_view(['POST'])
@ensure_csrf_cookie
def login_user(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(username=username, password=password)
    if user is not None:
        login(request, user)
        return Response({'message': 'Login successful'})
    else:
        return Response({'error': 'Invalid credentials'}, 
                      status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
def logout_user(request):
    logout(request)
    return Response({'message': 'Logged out successfully'})

@api_view(['GET'])
@ensure_csrf_cookie
def check_auth(request):
    if request.user.is_authenticated:
        return Response({
            'isAuthenticated': True,
            'username': request.user.username
        })
    return Response({'isAuthenticated': False})
