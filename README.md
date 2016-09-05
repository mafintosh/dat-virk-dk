# dat-virk-dk

Node program that imports accounting data from virk.dk into dat

```
npm install -g dat-virk-dk
```

## Usage

``` sh
# will print out the dat key
dat-virk-dk
```

On other computers

``` sh
npm install -g dat
dat <key-from-above> virk-dk-accounting
```

The dataset consists of PDFs + XML descriptions of the yearly accounting report done
by every Danish company. It is stored in the following format

```
{cvr-number}/{from-date-to-date}.pdf
{cvr-number}/{from-date-to-date}.xml
```

Currently a hosted version of this is available through the following dat key.

``` sh
dat 021f66c30327bd9e13908bf1c1d66d83fd962ec6aa4539f6c682e7a2e9301ba1 virk-dk-accounting
```

## License

MIT
