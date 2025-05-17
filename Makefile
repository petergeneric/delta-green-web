all: site

-include Makefile.local

site:
	rsync -avzr * home:/var/www/delta-green/
