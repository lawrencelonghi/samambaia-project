from django.shortcuts import render
from .models import Categoria, Produto
from django.db.models import Case, When, IntegerField, Value

def menu(request):
    desired_order = [
        'Porções',
        'Acepipes',
        'Lanches',
        'Doces',
        'Drinks',
        'Cervejas',
        'Vinhos',
        'Bebidas',
        'Almoço'
    ]
    

    categorias = Categoria.objects.annotate(
        custom_order=Case(
            *[When(name=name, then=Value(index)) 
              for index, name in enumerate(desired_order)],
            output_field=IntegerField()
        )
    ).order_by('custom_order')
    
    return render(request, 'menuapp/menu.html', {'categorias': categorias})