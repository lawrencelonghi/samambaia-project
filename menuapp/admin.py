from django.contrib import admin

from .models import Produto
from .models import Categoria


admin.site.register(Produto)
admin.site.register(Categoria)
# Register your models here.
