# Change Log

#### v1.3.1

* Check userAgent for string in the method `kadira.debug.getBrowserName`

#### v1.3.0
* Use the actual browser name as the browseId. For this we parse, the userAgent. But, we don't parse it on the client. Instead, we do it on the server. By doing that, we don't need to send some additional code to the client. (ua-parser code)

#### v1.2.0
* Track live updates in a very efficient way. For now, we only track the count and collection only. We don't track fields yet.
* Fixed an issue with our use of time to send data.

#### v1.1.0
* Add a set of testing covering almost all of the code base

#### v1.0.1

* Fix a potential rendering issue. See [#1](https://github.com/meteorhacks/kadira-debug/issues/1)
* Template event's event get tracked before the activity. That makes the 

#### v1.0.0

* Initial release without any critical issues or bugs.
