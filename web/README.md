The files in this directory will be installed as part of the piaware
sdcard instance and served by lighttpd.

Notes
=====

To prevent any sort of page generation from being done on the device itself, a
rewrite rule is used for localization.

All of the translated strings are stored in a .js file and changed client-side.
When the page loads it will request /translations/lang.js, which will be
rewritten to the correct file according to the `Accept-Language` header.

You can do this by enabling `mod_rewrite` and adding something like this to
`/etc/lighttpd/lighttpd.conf`:

```
$HTTP["language"] =~ "(en|es)" {
    url.rewrite = ( "^/translations/lang.js$" => "/translations/%1.js" )
}
else $HTTP["language"] =~ ".*" {
    url.rewrite = ( "^/translations/lang.js$" => "/translations/en.js" )
}
```
