# loki-demo

## loki infra

https://grafana.com/docs/loki/latest/get-started/quick-start/

## Perguntas

- devo mostrar um erro caso mais de um sampling seja definido?
- implementar logging?
- implementar env? imagino que não

## To do

- Coletar metricas dos algoritmos, e enviar para o Grafana. (metricas de `recall` e `precision`)
- pearing de chaves
- redis vs. pearing
- explicar o sampling no tcc, field_list pra criar chaves, etc.
- um sampling pra cada regra, (mapa de sampling, `regra` -> `instancia do sampling`)
- criar `conditions` para os samplers
- fix deterministic sampler

## TCC

Comparar algoritmos usando as metricas de `recall` e `precision`. Usando logs
estáticos.

## Old config.yaml

```yaml
processors:
  dynlogsampler:
    samplers:
      static:
        params:
          rates:
            key: 200•
            value: 100
        field_list:
          - http.status_code
```

## Reuniões

### 18/09/2024

- Sampling parecido com Refinery.
- Dizer qual o algoritmo de sampling a amostra utilizou.
  11 out
