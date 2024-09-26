### expo-notifications dev setup

The idea about how developing expo-notifications can be done is: use the `expo` monorepo as a git submodule and point the `expo-notifications` package to the code in the monorepo.

Why this is a good idea: we'll be able to push changes in the `expo-notifications` package to the `expo` monorepo and test them in the `microfoam` app.

Why this is a bad idea: it turns out, making `expo-notifications` an exception in how it's handled is not enough. `expo-notifications` depends on `expo-modules-core` so you might need to make that package also "exceptional" and also `expo`, `expo-task-manager`, `expo-updates` and `expo-updates-interface`. These cover the "core deps" of any app. The better approach might be to use the same setup as `bare-expo` has in the `expo` monorepo, also because it doesn't require manual changes. Anyway, I (Vojta) spent time on this and got it working so I'll use it as it unless there's issues.

steps taken to do this:

0. upgraded RN to 0.75 to be closer to what the `expo` monorepo uses
1. `git submodule add -b main git@github.com:expo/expo.git` (you prob don't need to do this (?), it's already done. Add `--depth 1` for faster cloning but no git history - prob not worth the speed improvement). But you may need (?) `git submodule update --recursive --remote` to get the latest changes if needed.
2. changes done to use the local expo-notifications package:
- **symlinks**: in repo root, run `./setup_monorepo.sh` to create symlinks to the `expo` monorepo. This happens in `postinstall` too.
- metro config changes
- package.json changes so that expo-modules-autolinking "sees" the exceptions
- `npx expo prebuild --clean` in the app folder
- you might need podfile changes in post_install to avoid xcode build target issues:
```ruby
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = podfile_properties['ios.deploymentTarget']
      end
    end
```
- start metro with `-c` to clear cache


### Notes
- As development takes place on `main` we might need to ignore updates in `expo` and `expo-modules-core` because they might "run away" from the app's code. Just something to keep in mind when doing `git pull` in the `expo` submodule.
- `expo-notifications` requires code to be built into the `build` folder, keep that in mind when developing in TS files. 


### Android native dep issues

`cd apps/mobile/android && ./gradlew :app:dependencies`
