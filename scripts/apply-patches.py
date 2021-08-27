from os import listdir, system

ignores = ['react-native-webview']
patches = listdir('patches')

for dpatch in patches:
    if '.patch' not in dpatch:
        continue
    package = dpatch.split('+')[0]
    if package in ignores:
        continue
    print('Applying patch {}...'.format(dpatch))
    system('patch -p1 < patches/{}'.format(dpatch))
