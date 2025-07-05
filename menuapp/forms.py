from django import forms

from .models import Produto

class HandleItem(forms.ModelForm):
  class Meta:
    model = Produto
    fields = '__all__'