from django.shortcuts import render
from django.http import HttpResponse
from django.views import View
from .models import Produto
from .models import Categoria


def hello(request):
    return HttpResponse('hello world')

def menu(request):
    # Get all categories with their related items
    categorias = Categoria.objects.prefetch_related('produtos').all()
    
    return render(request, 'menuapp/menu.html', { 'categorias': categorias })